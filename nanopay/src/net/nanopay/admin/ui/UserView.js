foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'UserView',
  extends: 'foam.u2.View',

  documentation: 'View displaying a table with a list of all shoppers and merchants',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'foam.nanos.auth.User'
  ],

  exports: [ 
    'as data',
    'filter',
    'filteredUserDAO' 
  ],

  imports: [
    'stack', 'userDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 962px;
          margin: 0 auto;
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
          display: inline-block;
          margin: 0;
          margin-bottom: 30px;
          vertical-align: top;
          border: 0;
          box-shadow:none;
          padding: 10px 10px 10px 31px;
          font-size: 14px;
        }
        ^ .inline-float-right {
          float: right;
          display: inline-block;
        }
        ^ .net-nanopay-ui-ActionView-exportButton {
          position: absolute;
          width: 75px;
          height: 35px;
          opacity: 0.01;
          cursor: pointer;
          z-index: 100;
          margin-right: 5px;
        }
        ^ .net-nanopay-ui-ActionView-sendMoney {
          width: 136px;
          height: 40px;
          background: #59a5d5;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: white;
          margin: 0;
          outline: none;
          float: right;
        }
        ^ .net-nanopay-ui-ActionView-sendMoney:hover {
          background: #3783b3;
          border-color: #3783b3;
        }
        ^ .net-nanopay-ui-ActionView-addUser {
          background-color: #EDF0F5;
          border: solid 1px #59A5D5;
          color: #59A5D5;
          margin-right: 5px;
          float: right;
        }
      */}
    })
  ],

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
    { name: 'data', factory: function() { return this.userDAO; }},
    {
      name: 'filteredUserDAO',
      expression: function(data, filter) {
        return data.where(this.CONTAINS_IC(this.User.FIRST_NAME, filter));
      },
      view: {
        class: 'foam.u2.view.TableView',
        columns: [
          'id', 'firstName', 'email', 'type'
        ]
      }
    }
  ],

  messages: [
    { name: 'placeholderText', message: 'Looks like their aren\'t any users registered yet. Please add users by selecting Add Shopper or Add Merchant.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
              .start(this.FILTER).addClass('filter-search').end()
              .add(this.SEND_MONEY)
              .add(this.ADD_USER)
              .start().addClass('inline-float-right')
                .start({ class: 'net.nanopay.ui.ActionButton', data: { image: 'images/ic-export.png', text: 'Export' }}).add(this.EXPORT_BUTTON).end()
              .end()
            .end()
          .end()
          .add(this.FILTERED_USER_DAO)
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.userDAO, message: this.placeholderText, image: 'images/member-plus.png'})
        .end();
    }
  ],

  actions: [
    {
      name: 'exportButton',
      label: 'Export',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.ExportModal', exportData: X.filteredUserDAO}));
      }
    },
    {
      name: 'addUser',
      label: 'Add User',
      code: function(X) {

      }
    },
    {
      name: 'sendMoney',
      label: 'Send Money',
      code: function(X) {

      }
    }
  ]
});
