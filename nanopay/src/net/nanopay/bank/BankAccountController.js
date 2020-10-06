/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccountController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with bank accounts.',

  requires: [
    'foam.core.Action',
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BRBankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.sme.ui.SMEModal'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'ctrl',
    'notify',
    'stack',
    'subject',
    'auth'
  ],

  exports: [
    'selectedAccount'
  ],

  messages: [
    { name: 'DELETE_DEFAULT', message: 'Unable to delete default accounts. Please select a new default account if one exists.' },
    { name: 'UNABLE_TO_DELETE', message: 'Error deleting account: ' },
    { name: 'SUCCESSFULLY_DELETED', message: 'Bank account deleted.' },
    { name: 'IS_DEFAULT', message: 'is now your default bank account. Funds will be automatically transferred to and from this account.' },
    { name: 'UNABLE_TO_DEFAULT', message: 'Unable to set non verified bank accounts as default.' },
    { name: 'ALREADY_DEFAULT', message: 'is already a default bank account.' },
    { name: 'BANK_ACCOUNT_LABEL', message: 'Bank Account' }
  ],

  css: `
  .net-nanopay-sme-ui-SMEModal-inner {
    width: 515px;
    height: 500px;
  }
  .net-nanopay-sme-ui-SMEModal-content {
    overflow: scroll !important;
    padding: 30px;
  }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        var dao = this.subject.user.accounts.where(
          this.OR(
            this.INSTANCE_OF(this.CABankAccount),
            this.INSTANCE_OF(this.USBankAccount),
            this.INSTANCE_OF(this.BRBankAccount)
          )
        );
        dao.of = this.BankAccount;
        return dao;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'bankAccount',
      factory: function() {
        return (foam.lookup(`net.nanopay.bank.${ this.subject.user.address.countryId }BankAccount`)).create({}, this);
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
            this.BankAccount.NAME.clone().copyFrom({
              tableWidth: 168
            }),
            'flagImage',
            'denomination',
            'summary',
            'status',
            'isDefault'
          ],
          dblClickListenerAction: async function dblClick(account, id) {
            if ( ! account ) account = await this.__subContext__.accountDAO.find(id);
            if ( account.status === self.BankAccountStatus.UNVERIFIED && self.CABankAccount.isInstance(account) ) {
              self.ctrl.add(self.Popup.create().tag({
                class: 'net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm',
                bank: account
              }));
            }
          },
          contextMenuActions: [
            foam.core.Action.create({
              name: 'verifyAccount',
              isAvailable: function() {
                return this.cls_.name == self.CABankAccount.name;
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
                  self.notify(self.DELETE_DEFAULT, '', self.LogLevel.ERROR, true);
                  return;
                }
                
                this.deleted = true;
                this.status = self.BankAccountStatus.DISABLED;

                self.ctrl.add(self.Popup.create().tag({
                  class: 'foam.u2.DeleteModal',
                  dao: self.subject.user.accounts,
                  data: this
                }));
              }
            }),
            foam.core.Action.create({
              name: 'Set as Default',
              code: function(X) {
                if ( this.isDefault ) {
                  self.notify(`${ this.name } ${ self.ALREADY_DEFAULT }`, '', self.LogLevel.WARN, true);
                  return;
                }
                this.isDefault = true;
                self.subject.user.accounts.put(this).then(() =>{
                  self.notify(`${ this.name } ${ self.IS_DEFAULT }`, '', self.LogLevel.INFO, true);
                }).catch((err) => {
                  this.isDefault = false;
                  self.notify(self.UNABLE_TO_DEFAULT, '', self.LogLevel.ERROR, true);
                });
              }
            }),
            foam.core.Action.create({
              name: 'Edit',
              isAvailable: function() {
                return ! this.verifiedBy
              },
              code: function(X) {
                self.ctrl.add(self.SMEModal.create().tag(
                  {
                    class: 'net.nanopay.account.ui.BankAccountWizard',
                    data: this,
                    useSections: ['accountDetails', 'pad']
                  }
                ));
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
            let permission = await this.auth.check(null, 'multi-currency.read');
            if ( permission ){
              X.controllerView.stack.push({
                class: 'net.nanopay.bank.ui.BankPickCurrencyView'
              }, self);
            } else {
              self.ctrl.add(this.SMEModal.create().tag({
                class: 'net.nanopay.account.ui.BankAccountWizard',
                data: this.bankAccount,
                useSections: ['accountDetails', 'pad']
              }));
            }
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
  ]
});
