// TODO: change to ablii export. Button/Action 'exportButton'
// TODO: TEMP FUNCTION FOR TESTING dbclick -> UNTIL CONTEXT BUTTON DONE: both edit and delete here - however one is commented out - for testing

foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'ContactView',
  extends: 'foam.u2.Controller',

  documentation: 'View to display a table with a list of all contacts',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.contacts.Contact',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.auth.User'
  ],

  imports: [
     'user'
  ],

  exports: [
    'filter',
    'filteredUserDAO',
    'dblclick'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 3.3%;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      background-color: #ffffff;
      vertical-align: top;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .net-nanopay-ui-ActionView-exportButton {
      float: right;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      width: 75px;
      height: 40px;
      cursor: pointer;
      z-index: 100;
      margin-right: 150px;
    }
    ^ .net-nanopay-ui-ActionView-exportButton img {
      margin-right: 5px;
    }
    ^ table {
      width: 1240px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'Search',
        onKey: true
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.user.contacts;
      }
    },
    'countContact',
    {
      name: 'filteredUserDAO',
      expression: function(data, filter) {
        return data.where(this.
          OR(this.CONTAINS_IC(this.User.LEGAL_NAME, filter),
            this.CONTAINS_IC(this.User.EMAIL, filter),
            this.CONTAINS_IC(this.User.ORGANIZATION, filter)));
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          net.nanopay.contacts.Contact.ORGANIZATION.clone().copyFrom({ label: 'Company' }),
          net.nanopay.contacts.Contact.LEGAL_NAME.clone().copyFrom({ label: 'Name' }),
          'email',
          'status'
        ]
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Contacts' },
    { name: 'SUBTITLE', message: 'contacts' },
    { name: 'PLACE_HOLDER_TEXT', message: 'Looks like you do not have any Contacts yet. Please add Contacts by clicking the \'Add a Contact\' button above.' }
  ],

  methods: [
    function initE() {
      this.filteredUserDAO.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this.SUPER();
      this
        .addClass(this.myClass())
        .start().style({ 'font-size' : '20pt' }).add(this.TITLE).end()
        .start()
          .start(this.ADD_CONTACT).style({ 'float': 'right' }).end()
        .end()
        .start().style({ 'float': 'left' })
          .start(this.EXPORT_BUTTON, { icon: 'images/ic-export.png', showLabel: true })
          .style({ 'margin-top': '15px', 'margin-bottom': '15px' })
          .end()
          .start().style({ 'margin-top': '15px', 'margin-bottom': '15px' })
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
            .start(this.FILTER).addClass('filter-search').end()
          .end()
        .end()
        .start().add(this.countContact$).add(' ' + this.SUBTITLE).style({ 'font-size': '12pt', 'float': 'left', 'margin-top': '9%', 'padding': '1%', 'margin-left': '-19%' }).end()
        .add(this.FILTERED_USER_DAO)
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.filteredUserDAO, message: this.PLACE_HOLDER_TEXT, image: 'images/person.svg' });
    },
    function dblclick(contact) {
      // TEMP FUNCTION FOR TESTING -> UNTIL CONTEXT BUTTON DONE
      //this.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.ContactModal', data: contact, isEdit: true }));
      this.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.ContactModal', data: contact, isDelete: true }));
    },
    async function calculatePropertiesForStatus() {
      var count = await this.filteredUserDAO.select(this.COUNT());
      this.countContact = count.value;
      if ( ! this.countContact ) this.countContact = '...';
    }
  ],

  actions: [
    {
      name: 'exportButton',
      label: 'sync',
      code: function(X) {
        // TODO: change to ablii export. Currently copied for UserView.js
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({ class: 'net.nanopay.ui.modal.ExportModal', exportData: X.filteredUserDAO }));
      }
    },
    {
      name: 'addContact',
      label: 'Add a Contact',
      code: function(X) {
        this.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.ContactModal' }));
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.calculatePropertiesForStatus();
      }
    }
  ]
});
