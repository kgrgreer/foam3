foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount',
  name: 'BankAccountSettingsView',
  extends: 'foam.u2.Controller',

  documentation: 'View for editing user business bank account information.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'stack', 'bankAccountDAO'
  ],

  requires: [
    'net.nanopay.model.BankAccount',
    'foam.u2.dialog.Popup',
    'foam.nanos.menu.SubMenuView',
    'foam.nanos.menu.Menu'
  ],

  properties: [
      { name: 'data', factory: function() { return this.bankAccountDAO; } },
      [ 'of', 'net.nanopay.admin.model.BankAccount' ]
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .foam-u2-view-TableView-th-amount {
          text-align: left !important;
        }
        ^ table {
          width: 97%;
        }
        ^ thead > tr > th {
          background-color: rgba(94, 145, 203, 0.4);
          font-family: Roboto;
          font-size: 14px;
          font-weight: normal;
          line-height: 1.0;
          letter-spacing: 0.4px;
          color: #093649;
          text-align: left;
          padding-left: 65px;
        }
        ^ td {
          padding-left: 65px;
        }
        ^ .foam-u2-ActionView-addBank {
          width: 135px;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #5e91cb;
          cursor: pointer;
          font-family: Roboto;
          font-size: 14px;
          line-height: 2.86;
          letter-spacing: 0.2px;
          text-align: center;
          color: #5e91cb;
          margin-top: 40px;
          margin-left: auto;
          margin-right: auto;
          display: table;
          background-color: transparent;
          padding: 0;
        }
        ^no-pending-top-ups {
          font-family: Roboto;
          font-size: 14px;
          letter-spacing: 0.2px;
          color: #093649;
          text-align: center;
          display: block;
          padding: 30px;
        }
        ^ .foam-u2-ActionView-bankAccount{
          color: #093649 !important;
        }
        ^ .foam-nanos-menu-SubMenuView-inner {
          position: absolute;
          float: right;
          z-index: 10000;
          width: 208px;
          height: 160px;
          background: white;
          box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
          top: 65px;
          right: 15px;
        }
        ^ .foam-nanos-menu-SubMenuView-inner > div {
          height: 40px;
          padding-left: 50px;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #14375d;
          line-height: 40px;
        }
        ^ .foam-nanos-menu-SubMenuView-inner > div:last-child {
          background-color: #f6f9f9;
          box-shadow: 0 -1px 0 0 #e9e9e9;
          font-size: 14px;
          letter-spacing: 0.2px;
          color: #c82e2e;
        }
        ^ .foam-nanos-menu-SubMenuView-inner > div:hover {
          background-color: #5E91CB;
          color: white;
          cursor: pointer;
        }
        ^ .foam-nanos-menu-SubMenuView-inner::after {
          content: ' ';
          position: absolute;
          height: 0;
          width: 0;
          border: 8px solid transparent;
          border-bottom-color: white;
          -ms-transform: translate(140px, -176px);
          transform: translate(140px, -176px);
        }
      */}
    })
  ],

  messages: [
    { name: 'emptyBankAccount',   message: 'Add your first bank account to top up' },
    { name: 'ActionAdd',          message: 'Add a new bank account' },
  ],

  methods: [
    function initE() {
      this.SUPER();
      var view = this;

      this
        .addClass(view.myClass())
        .tag({class: 'net.nanopay.admin.ui.settings.SettingsNavigator'})
        .start()
          .start()
            .add(this.BankAccountTableView.create())
          .end()
          .start('span')
            .addClass(view.myClass('no-pending-top-ups'))
            .add(view.slot(function(count) {
                return count.value == 0 ? view.emptyBankAccount : '';
              }, view.daoSlot(this.bankAccountDAO, this.COUNT())))
          .start()
            .tag(this.ADD_BANK, { showLabel: true })
            // .style(view.slot(function(count) {
            //     return count.value == 0 ? 'background-color: #5e91cb !important' : '';
            // }, view.daoSlot(this.bankAccountDAO, this.COUNT())))
            // .style({background-color: '#5e91cb !important'})
          .end()
          // .start()
          //   .tag(this.DROPDOWN, { showLabel: true })
          // .end()
        .end()
    }
  ],

  classes: [
    {
      name: 'BankAccountTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.model.BankAccount' ],
      imports: [ 'bankAccountDAO' ],

      properties: [
        'selection',
        { name: 'data', factory: function() { return this.bankAccountDAO; }}
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              config: {
                status: {
                  tableCellView: function(obj, e) {
                    return e.E().style({color: '#2cab70'})
                  }
                }
              },
              columns: [
                'accountName', 'transitNumber', 'bankNumber', 'accountNumber', 'status'
              ],
            }).end()
        }
      ]

    }
  ],

  actions: [
    {
      name: 'addBank',
      label: 'Add Bank Account',
      code: function() {
        this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.settings.bankAccount.form.BankForm', title: 'Connect a new bank account'}));
      }
    },
    {
      name: 'verifyAccount',
      label: 'Verify Account',
      code: function() {
        this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.settings.bankAccount.form.BankForm', startAt: 2 }))
      }
    },
    {
      name: 'changeName',
      label: 'Change Name',
      code: function() {
        this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.settings.bankAccount.dropdown.ChangeAccountNameView'}));
      }
    },
    {
      name: 'deleteAccount',
      label: 'Delete Account',
      code: function() {
        this.add(this.Popup.create().tag({class: 'net.nanopay.admin.ui.settings.bankAccount.dropdown.DeleteBankAccountView'}));
      }
    },
    {
      name: 'dropdown',
      label: 'Dropdown',
      code: function(){
        this.add(this.SubMenuView.create({menu: this.Menu.create({id: 'accountSettings'})}));
      }
    }
  ]
});
