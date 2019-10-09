foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ReceivableController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController to work with receivable invoices.',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice'
  ],

  implements: [
    'net.nanopay.accounting.AccountingIntegrationTrait'
  ],

  imports: [
    'checkAndNotifyAbilityToReceive',
    'currencyDAO',
    'notify',
    'stack',
    'user',
    'accountingIntegrationUtil'
  ],

  messages: [
    { name: 'VOID_SUCCESS', message: 'Invoice successfully voided.' },
    { name: 'VOID_ERROR', message: 'Invoice could not be voided.' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      factory: function() {
        return this.user.sales;
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
            this.Invoice.PAYER_ID.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payer.businessName ?
                  invoice.payer.businessName :
                  invoice.payer.label();
                this.add(additiveSubField);
              }
            }),
            this.Invoice.INVOICE_NUMBER.clone().copyFrom({
              label: 'Invoice No.',
              tableWidth: 115
            }),
            this.Invoice.AMOUNT.clone().copyFrom({ tableWidth: 115 }),
            this.Invoice.ISSUE_DATE.clone().copyFrom({ tableWidth: 115 }),
            this.Invoice.DUE_DATE.clone().copyFrom({ tableWidth: 115 }),
            this.Invoice.STATUS.clone().copyFrom({ tableWidth: 115 }),
            'invoiceFile'
          ],
          contextMenuActions: [
            foam.core.Action.create({
              name: 'viewDetails',
              label: 'View details',
              code: function(X) {
                X.stack.push({
                  class: 'net.nanopay.sme.ui.InvoiceOverview',
                  invoice: this,
                  isPayable: false
                });
              }
            }),
            foam.core.Action.create({
              name: 'edit',
              label: 'Edit',
              isAvailable: function() {
                return this.status === self.InvoiceStatus.DRAFT;
              },
              code: function(X) {
                self.checkAndNotifyAbilityToReceive().then((result) => {
                  if ( ! result ) return;
                  X.menuDAO.find('sme.quickAction.request').then((menu) => {
                    var clone = menu.clone();
                    Object.assign(clone.handler.view, {
                      isPayable: false,
                      isForm: true,
                      isDetailView: false,
                      invoice: this
                    });
                    clone.launch(X, X.controllerView);
                  });
                });
              }
            }),
            foam.core.Action.create({
              name: 'markVoid',
              label: 'Mark as Void',
              isEnabled: function() {
                if ( self.user.id != this.createdBy ) return false;
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              isAvailable: function() {
                if ( self.user.id != this.createdBy ) return false;
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.PAID ||
                  this.status === self.InvoiceStatus.PROCESSING ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                self.ctrl.add(self.Popup.create().tag({
                  class: 'net.nanopay.invoice.ui.modal.MarkAsVoidModal',
                  invoice: this
                }));
                // this.paymentMethod = self.PaymentStatus.VOID;
                // self.user.sales.put(this).then((invoice)=> {
                //   if (invoice.paymentMethod == self.PaymentStatus.VOID) {
                //     self.notify(self.VOID_SUCCESS, 'success');
                //   }
                // }).catch((err) => {
                //   if ( err ) self.notify(self.VOID_ERROR, 'error');
                // });;
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
                self.user.sales.remove(this);
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
          name: 'reqMoney',
          label: 'Request payment',
          code: function(X) {
            self.checkAndNotifyAbilityToReceive().then((result) => {
              if ( result ) {
                X.menuDAO.find('sme.quickAction.request').then((menu) => {
                  var clone = menu.clone();
                  Object.assign(clone.handler.view, {
                    invoice: self.Invoice.create({}),
                    isPayable: false,
                    isForm: true,
                    isList: false,
                    isDetailView: false
                  });
                  clone.launch(X, X.controllerView);
                });
              }
            });
          }
        });
      }
    }
  ],

  listeners: [
    {
      name: 'dblclick',
      code: async function(invoice) {
        if ( invoice.status == this.InvoiceStatus.DRAFT ) {
          let updatedInvoice = await this.accountingIntegrationUtil.forceSyncInvoice(invoice);
          if ( updatedInvoice === null || updatedInvoice === undefined ) return;
        }
        this.stack.push({
          class: 'net.nanopay.sme.ui.InvoiceOverview',
          invoice: invoice,
          isPayable: false
        });
      }
    }
  ]
});
