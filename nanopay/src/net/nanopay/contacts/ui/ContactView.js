// TODO: change to ablii export. Button/Action 'exportButton'

foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'ContactView',
  extends: 'foam.u2.Controller',

  documentation: 'View to display a table with a list of all contacts',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.contacts.Contact'
  ],

  imports: [
     'user',
     'contactDAO'
  ],

  exports: [
    'filter',
    'filteredUserDAO'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
      z-index: 1;
      position: relative;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
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
      border: 1px solid #ddd;
    }
    ^ .net-nanopay-ui-ActionView-exportButton {
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
    ^top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .net-nanopay-ui-ActionView-exportButton {
      float: none;
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
      view: function() {
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            net.nanopay.contacts.Contact.ORGANIZATION.copyFrom({ label: 'Company' }),
            net.nanopay.contacts.Contact.LEGAL_NAME.copyFrom({ label: 'Name' }),
            'email',
            'status'
          ]
         };
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Contacts' },
    { name: 'CONTACT_SINGULAR', message: 'contact' },
    { name: 'CONTACT_PLURAL', message: 'contacts' },
    { name: 'PLACE_HOLDER_TEXT', message: 'Looks like you do not have any Contacts yet. Please add Contacts by clicking the \'Add a Contact\' button above.' }
  ],

  methods: [
    function initE() {
      var view = this;
      this.contactDAO.on.sub(this.onDAOUpdate);
      this.filteredUserDAO$.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('top-bar'))
          .start('h1').add(this.TITLE).end()
          .tag(this.ADD_CONTACT)
        .end()
        .start()
          .tag({
            class: 'net.nanopay.integration.IntegrationSignInView',
          }).style({ 'display': 'contents' })      
        .end()
        .start('p')
          .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
            .addClass('searchIcon')
          .end()
          .start(this.FILTER).addClass('filter-search').end()
        .end()
        .start('p')
          .add(this.countContact$.map((count) => {
            var word = count === 1 ?
              this.CONTACT_SINGULAR :
              this.CONTACT_PLURAL;
            return `${count} ${word}`;
          }))
        .end()
        .tag(this.FILTERED_USER_DAO, {
          contextMenuActions: [
            foam.core.Action.create({
              name: 'edit',
              code: function(X) {
                view.add(view.Popup.create().tag({
                  class: 'net.nanopay.contacts.ui.modal.ContactModal',
                  data: this,
                  isEdit: true
                }));
              }
            }),
            foam.core.Action.create({
              name: 'requestMoney',
              code: function(X) {
                alert('Not implemented yet!');
                // TODO: Fill this in when we have the request money screens.
              }
            }),
            foam.core.Action.create({
              name: 'sendMoney',
              code: function(X) {
                alert('Not implemented yet!');
                // TODO: Fill this in when we have the send money screens.
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              code: function(X) {
                view.add(view.Popup.create().tag({
                  class: 'net.nanopay.contacts.ui.modal.ContactModal',
                  data: this,
                  isDelete: true
                }));
              }
            })
          ]
        })
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.filteredUserDAO, message: this.PLACE_HOLDER_TEXT, image: 'images/person.svg' });
    },
    async function calculatePropertiesForStatus() {
      var count = await this.filteredUserDAO.select(this.COUNT());
      this.countContact = count.value ? count.value : '0';
    }
  ],

  actions: [
    {
      name: 'exportButton',
      label: 'sync',
      code: function(X) {
        // TODO: add ablii export.
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
