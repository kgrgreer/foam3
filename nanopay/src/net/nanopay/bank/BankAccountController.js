foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccountController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with bank accounts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.NotificationMessage',
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
    'ctrl',
    'notify',
    'stack',
    'user'
  ],

  exports: [
    'selectedAccount'
  ],

  messages: [
    { name: 'DELETE_BANK_MESSAGE', message: 'Please contact us at support@ablii.com to delete this bank account.' },
    { name: 'DELETE_DEFAULT', message: 'Unable to delete default accounts.' },
    { name: 'UNABLE_TO_DELETE', message: 'Error deleting account: ' },
    { name: 'SUCCESSFULLY_DELETED', message: 'Bank account deleted.' },
    { name: 'IS_DEFAULT', message: 'is now your default bank account. Funds will be automatically transferred to this account' },
    { name: 'UNABLE_TO_DEFAULT', message: 'Unable to set bank account as default.' }
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
          columns: [
            'name',
            'flagImage',
            'denomination',
            'summary',
            'status',
            'isDefault'
          ],
          contextMenuActions: [
            foam.core.Action.create({
              name: 'verifyAccount',
              isAvailable: function() {
                return this.type != self.USBankAccount.name;
              },
              isEnabled: function() {
                return this.status === self.BankAccountStatus.UNVERIFIED;
              },
              code: function(X) {
                self.selectedAccount = this;
                self.ctrl.add(self.Popup.create().tag({
                  class: 'net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm',
                  bank: self.selectedAccount
                }));
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              code: function(X) {
                if ( this.isDefault ) {
                  self.notify(this.DELETE_DEFAULT, 'error');
                  return;
                }
                self.user.accounts.remove(this).then(() =>{
                  self.notify(self.SUCCESSFULLY_DELETED);
                }).catch((err) => {
                  self.notify(self.UNABLE_TO_DELETE, 'error');
                });
              }
            }),
            foam.core.Action.create({
              name: 'Set as Default',
              code: function(X) {
                this.isDefault = true;
                self.user.accounts.put(this).then(() =>{
                  self.notify(`${ this.name } ${ self.IS_DEFAULT }`);
                }).catch((err) => {
                  self.notify(self.UNABLE_TO_DEFAULT, 'error');
                });
              }
            })
          ]
        };
      }
    },
    {
      name: 'primaryAction',
      factory: function() {
        var self = this;
        return this.Action.create({
          name: 'addBank',
          label: 'Add bank account',
          code: async function(X) {
            var USEnabled = self.user.address.countryId != 'CA';
            X.controllerView.stack.push({
              class: 'net.nanopay.bank.ui.BankPickCurrencyView',
              usdAvailable: USEnabled,
              cadAvailable: ! USEnabled
            }, self);
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
    {
      class: 'Boolean',
      name: 'available',
      value: false,
      documentation: `used for disabling the button for adding a Bank Account when User has one of each currency (CAD && USD)`
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function onEdit(account) {
        if ( account.status === this.BankAccountStatus.UNVERIFIED && account.denomination == 'CAD' ) {
          this.ctrl.add(this.Popup.create().tag({
            class: 'net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm',
            bank: account
          }));
        }
      }
    }
  ]
});
