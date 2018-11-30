foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccountController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with bank accounts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'stack',
    'user'
  ],

  exports: [
    'selectedAccount'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        var dao = this.user.accounts.where(
          this.OR(
            this.EQ(this.Account.TYPE, this.BankAccount.name),
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          )
        );
        dao.of = this.BankAccount;
        return dao;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        var self = this;
        return {
          class: 'foam.u2.view.ScrollTableView',
          editColumnsEnabled: false,
          contextMenuActions: [
            foam.core.Action.create({
              name: 'verifyAccount',
              isEnabled: function() {
                return this.status === self.BankAccountStatus.UNVERIFIED;
              },
              code: function(X) {
                self.selectedAccount = this;
                self.stack.push({
                  class: 'net.nanopay.cico.ui.bankAccount.AddBankView',
                  wizardTitle: 'Verification',
                  startAtValue: 2,
                  nextLabelValue: 'Verify',
                  backLabelValue: 'Come back later'
                }, self);
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              code: function(X) {
                X.controllerView.add(self.Popup.create().tag({
                  class: 'net.nanopay.sme.ui.DeleteBankAccountModal',
                  account: this
                }));
              }
            })
          ]
        };
      }
    },
    {
      name: 'primaryAction',
      factory: function() {
        return this.Action.create({
          name: 'addBank',
          label: 'Add bank account',
          code: function() {
            this.stack.push({
              class: 'net.nanopay.bank.ui.BankPickCurrencyView'
            }, this);
          }
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'selectedAccount',
      documentation: `
        The account that the user wants to verify. Exported so that BankForm
        can use it.
      `
    },
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function onEdit(account) {
        // Do nothing.
      }
    }
  ]
});
