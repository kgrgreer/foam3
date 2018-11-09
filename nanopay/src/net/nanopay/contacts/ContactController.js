foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ContactController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with contacts.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.invoice.model.Invoice'
  ],

  implements: [
    'net.nanopay.integration.AccountingIntegrationTrait'
  ],

  imports: [
    'user'
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
      name: 'primaryAction',
      factory: function() {
        return this.Action.create({
          name: 'addContact',
          label: 'Add a Contact',
          code: function(X) {
            this.add(this.Popup.create().tag({
              class: 'net.nanopay.contacts.ui.modal.ContactModal'
            }));
          }
        });
      }
    },
    {
      name: 'contextMenuActions',
      factory: function() {
        var self = this;
        return [
          this.Action.create({
            name: 'edit',
            code: function(X) {
              X.controllerView.add(self.Popup.create(null, X).tag({
                class: 'net.nanopay.contacts.ui.modal.ContactModal',
                data: this,
                isEdit: true
              }));
            }
          }),
          this.Action.create({
            name: 'requestMoney',
            code: function(X) {
              X.stack.push({
                class: 'net.nanopay.sme.ui.SendRequestMoney',
                invoice: self.Invoice.create({ payerId: this.id }),
                isPayable: false
              });
            }
          }),
          this.Action.create({
            name: 'sendMoney',
            code: function(X) {
              X.stack.push({
                class: 'net.nanopay.sme.ui.SendRequestMoney',
                invoice: self.Invoice.create({ payeeId: this.id }),
                isPayable: true
              });
            }
          }),
          this.Action.create({
            name: 'delete',
            code: function(X) {
              X.controllerView.add(self.Popup.create(null, X).tag({
                class: 'net.nanopay.contacts.ui.modal.ContactModal',
                data: this,
                isDelete: true
              }));
            }
          })
        ];
      }
    }
  ]
});
