foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankView',
  extends: 'foam.u2.View',

  documentation: 'View displaying a table with a list of banks',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'foam.nanos.auth.User'
  ],

  exports: [
    'as data',
    'filter',
    'filteredUserDAO',
    'dblclick'
  ],

  imports: [
    'stack', 'userDAO'
  ],

  css: `
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
    ^ .net-nanopay-ui-ActionView-addBank {
      background-color: #59A5D5;
      border: solid 1px #59A5D5;
      color: white;
      float: right;
    }
    ^ .popUpDropDown {
      padding: 0;
      z-index: 10000;
      width: 135px;
      height: 60px;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
      position: absolute;
    }
    ^ .popUpDropDown > div {
      width: 135px;
      height: 30px;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      line-height: 30px;
    }
    ^ .popUpDropDown > div:hover {
      background-color: #59a5d5;
      color: white;
      cursor: pointer;
    }
  `,

  properties: [
    {
      name: 'data',
      factory: function(){
        return this.userDAO.where(this.EQ(this.User.TYPE, 'Bank'));
      }
    },
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
      name: 'filteredUserDAO',
      expression: function(data, filter) {
        return this.userDAO.where(this.OR(this.CONTAINS_IC(this.User.FIRST_NAME, filter), this.CONTAINS_IC(this.User.EMAIL, filter), this.CONTAINS_IC(this.User.TYPE, filter)));
      },
      view: {
        class: 'foam.u2.view.TableView',
        columns: [
          'id', 'organization', 'branchId', 'clearingId', 'status'
        ]
      }
    }
  ],

  messages: [
    { name: 'placeholderText', message: 'Looks like their aren\'t any banks registered yet. Please add banks by clicking the Add Bank button above.' },
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
              .start(this.ADD_BANK).end()
              .start(this.EXPORT_BUTTON, { icon: 'images/ic-export.png', showLabel:true }).end()
            .end()
          .end()
          .add(this.FILTERED_USER_DAO)
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.data, message: this.placeholderText, image: 'images/person.svg'})
        .end();
    },

    function dblclick(user){
      this.stack.push({ class: 'net.nanopay.bank.ui.BankDetailView', data: user});
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
      name: 'addBank',
      label: 'Add Bank',
      code: function(X) {
        var self = this;

        this.stack.push({ class: 'net.nanopay.admin.ui.AddShopperView' });
      }
    }
  ]
});
