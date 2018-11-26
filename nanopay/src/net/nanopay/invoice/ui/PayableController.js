foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'PayableController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with payable invoices.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  implements: [
    'net.nanopay.integration.AccountingIntegrationTrait'
  ],

  imports: [
    'stack',
    'user'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.user.expenses;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'summaryView',
      factory: function() {
        var self = this;
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            this.Invoice.PAYEE.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payee.businessName ?
                  invoice.payee.businessName :
                  invoice.payee.label();
                this.add(additiveSubField);
              }
            }),
            this.Invoice.INVOICE_NUMBER.clone().copyFrom({ label: 'Invoice No.' }),
            this.Invoice.AMOUNT.clone().copyFrom({
              tableCellFormatter: function(_, invoice) {
                invoice.destinationCurrency$find.then((currency) => {
                  this.add(`- ${currency.format(invoice.amount)}`);
                });
              }
            }),
            'dueDate',
            'lastModified',
            'status'
          ],
          contextMenuActions: [
            foam.core.Action.create({
              name: 'viewDetails',
              label: 'View details',
              code: function(X) {
                X.stack.push({
                  class: 'net.nanopay.sme.ui.InvoiceOverview',
                  invoice: this,
                  isPayable: true
                });
              }
            }),
            foam.core.Action.create({
              name: 'payNow',
              label: 'Pay now',
              isAvailable: function() {
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                X.stack.push({
                  class: 'net.nanopay.sme.ui.SendRequestMoney',
                  invoice: this,
                  isForm: false,
                  isList: false,
                  isDetailView: true,
                  isPayable: true
                });
              }
            }),
            foam.core.Action.create({
              name: 'markVoid',
              label: 'Mark as Void',
              isEnabled: function() {
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.OVERDUE ||
                  self.user.id === self.Invoice.CREATED_BY;
              },
              isAvailable: function() {
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.PAID ||
                  this.status === self.InvoiceStatus.PENDING ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                this.paymentMethod = self.PaymentStatus.VOID;
                self.user.expenses.put(this);
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              label: 'Delete',
              confirmationRequired: true,
              isAvailable: function() {
                return this.status === self.InvoiceStatus.DRAFT;
              },
              code: function(X) {
                self.user.expenses.remove(this);
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
          name: 'sendMoney',
          label: 'Send money',
          code: function(X) {
            X.stack.push({
              class: 'net.nanopay.sme.ui.SendRequestMoney',
              invoice: self.Invoice.create({}),
              isPayable: true
            });
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: function(invoice) {
        this.stack.push({
          class: 'net.nanopay.sme.ui.InvoiceOverview',
          invoice: invoice,
          isPayable: true
        });
      }
    }
  ]
});
