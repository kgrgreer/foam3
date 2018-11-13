foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BankingView',
  extends: 'foam.u2.Controller',

  documentation: 'Lets the user view and work with their bank accounts.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'stack',
    'user'
  ],

  exports: [
    'selectedAccount'
  ],

  requires: [
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
      z-index: 1;
      position: relative;
    }
    ^ table {
      width: 1240px;
    }
    ^ .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'selectedAccount',
      documentation: `
        The account that the user wants to verify. Exported so that BankForm
        can use it.
      `
    },
    {
      name: 'data',
      factory: function() {
        var dao = this.bankAccountDAO
            .where(
              this.AND(
                this.EQ(this.BankAccount.OWNER, this.user.id),
                // TODO: Use this.INSTANCE_OF(this.BankAccount) instead.
                this.OR(
                  this.EQ(this.Account.TYPE, this.USBankAccount.name),
                  this.EQ(this.Account.TYPE, this.BankAccount.name),
                  this.EQ(this.Account.TYPE, this.CABankAccount.name))));
        dao.of = this.BankAccount;
        return dao;
      }
    }
  ],

  messages: [
    {
      name: 'TITLE',
      message: 'Banking'
    },
    {
      name: 'PLACEHOLDER_TEXT',
      message: `You don't have any bank accounts right now. Click the Add ` +
        'bank account button to add a new bank account.'
    }
  ],

  methods: [
    function initE() {
      var view = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass('top-bar')
          .start('h1')
            .add(this.TITLE)
          .end()
          .tag(this.ADD_BANK)
        .end()
        .tag({
          class: 'foam.u2.view.ScrollTableView',
          data: this.data,
          editColumnsEnabled: false,
          contextMenuActions: [
            foam.core.Action.create({
              name: 'verifyAccount',
              isEnabled: function() {
                return this.status === view.BankAccountStatus.UNVERIFIED;
              },
              code: function(X) {
                view.selectedAccount = this;
                view.verifyAccount();
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              code: function(X) {
                view.add(view.Popup.create().tag({
                  class: 'net.nanopay.sme.ui.DeleteBankAccountModal',
                  account: this
                }));
              }
            })
          ]
        })
        .tag({
          class: 'net.nanopay.ui.Placeholder',
          dao: this.data,
          message: this.PLACEHOLDER_TEXT,
          image: 'images/ic-bankempty.svg'
        });
    },

    function verifyAccount() {
      this.stack.push({
        class: 'net.nanopay.cico.ui.bankAccount.AddBankView',
        wizardTitle: 'Verification',
        startAtValue: 2,
        nextLabelValue: 'Verify',
        backLabelValue: 'Come back later'
      }, this);
    }
  ],

  actions: [
    {
      name: 'addBank',
      label: 'Add bank account',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.flinks.view.form.FlinksForm',
          isCustomNavigation: true,
          hideBottomBar: true
        }, this);
      }
    }
  ]
});
