foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ContactController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with contacts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice'
  ],

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.accounting.AccountingIntegrationTrait'
  ],

  imports: [
    'accountingIntegrationUtil',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'stack',
    'user'
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
            this.Contact.ORGANIZATION.clone().copyFrom({
              tableWidth: undefined
            }),
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
              isEnabled: function() {
                return this.signUpStatus !== self.ContactStatus.ACTIVE;
              },
              code: function(X) {
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: 'net.nanopay.contacts.ui.modal.ContactWizardModal',
                  // Setting data enables the edit flow.
                  data: this
                }));
              }
            }),
            this.Action.create({
              name: 'invite',
              isEnabled: function() {
                return this.signUpStatus === self.ContactStatus.NOT_INVITED;
              },
              code: function(X) {
                X.controllerView.add(self.Popup.create(null, X).tag({
                  class: 'net.nanopay.contacts.ui.modal.InviteContactModal',
                  data: this
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
          code: function(X) {
            X.controllerView.add(this.Popup.create().tag({
              class: 'net.nanopay.contacts.ui.modal.ContactWizardModal'
            }));
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
