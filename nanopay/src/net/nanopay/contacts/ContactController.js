foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ContactController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with contacts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice'
  ],

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.accounting.AccountingIntegrationTrait'
  ],

  imports: [
    'accountDAO',
    'accountingIntegrationUtil',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'stack',
    'user',
    'pushMenu',
    'publicBusinessDAO',
  ],

  constants: [
    {
      type: 'String',
      name: 'WARNING_ICON',
      value: 'images/warning.svg'
    }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.user.contacts;
      }
    },
    {
      name: 'summaryView',
      factory: function() {
        var self = this;
        return {
          class: 'foam.u2.view.ScrollTableView',
          editColumnsEnabled: false,
          columns: [
            foam.core.Property.create({
              name: 'company',
              label: 'Company',
              tableCellFormatter: function(X, obj) {
                if ( ! obj.businessId ) {
                  this.start().add(obj.organization).end();
                } else {
                  self.publicBusinessDAO
                    .find(obj.businessId)
                    .then( (business) =>
                      this.start().add(business.label()).end()
                  );
                }
              }
            }),
            'legalName',
            'email',
            'signUpStatus',
            foam.core.Property.create({
              name: 'warning',
              label: '',
              tableWidth: 55,
              tableHeaderFormatter: function() { },
              tableCellFormatter: function(value, obj, axiom) {
                if ( obj.bankAccount === 0 && obj.businessId === 0 ) {
                  this.start()
                    .attrs({ title: 'Missing bank information' } )
                    .start({ class: 'foam.u2.tag.Image', data: self.WARNING_ICON }).end()
                    .end();
                }
              }
            })
          ],
          contextMenuActions: [
            this.Action.create({
              name: 'edit',
              label: 'View details',
              isEnabled: function() {
                return this.signUpStatus !== self.ContactStatus.ACTIVE;
              },
              code: function(X) {
                // disabled until new edit contact flow is implemented
              }
            }),
            this.Action.create({
              name: 'invite',
              isEnabled: function() {
                return this.signUpStatus === self.ContactStatus.NOT_INVITED;
              },
              isAvailable: async function() {
                let account = await self.accountDAO.find(this.bankAccount);
                return this.signUpStatus === self.ContactStatus.NOT_INVITED && ! self.INBankAccount.isInstance(account);
              },
              code: function(X) {
                var invite = net.nanopay.model.Invitation.create({
                  email: this.email,
                  businessName: this.organization,
                  createdBy: this.user.id,
                  isContact: true
                });
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: net.nanopay.contacts.ui.InvitationWizardView,
                  data: invite,
                  disableMenuMode: true
                }));
              }
            }),
            this.Action.create({
              name: 'requestMoney',
              isEnabled: function() {
                return (
                  this.businessId &&
                  this.businessStatus !== self.AccountStatus.DISABLED
                ) || this.bankAccount;
              },
              code: function(X) {
                self.checkAndNotifyAbilityToReceive().then((result) => {
                  if ( result ) {
                    X.menuDAO.find('sme.quickAction.request').then((menu) => {
                      var clone = menu.clone();
                      Object.assign(clone.handler.view, {
                        invoice: self.Invoice.create({ contactId: this.id }),
                        isPayable: false
                      });
                      clone.launch(X, X.controllerView);
                    });
                  }
                });
              }
            }),
            this.Action.create({
              name: 'sendMoney',
              isEnabled: function() {
                return (
                  this.businessId &&
                  this.businessStatus !== self.AccountStatus.DISABLED
                ) || this.bankAccount;
              },
              code: function(X) {
                self.checkAndNotifyAbilityToPay().then((result) => {
                  if ( result ) {
                    X.menuDAO.find('sme.quickAction.send').then((menu) => {
                      var clone = menu.clone();
                      Object.assign(clone.handler.view, {
                        invoice: self.Invoice.create({ contactId: this.id }),
                        isPayable: true
                      });
                      clone.launch(X, X.controllerView);
                    });
                  }
                });
              }
            }),
            this.Action.create({
              name: 'delete',
              code: function(X) {
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: 'net.nanopay.contacts.ui.modal.DeleteContactView',
                  data: this
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
          name: 'addContact',
          label: 'Add a Contact',
          code: function() {
            this.pushMenu('sme.menu.toolbar');
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function onEdit(contact) {
        // Do nothing.
      }
    }
  ]
});
