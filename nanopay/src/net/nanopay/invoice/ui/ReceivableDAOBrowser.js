foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ReceivableDAOBrowser',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.accounting.IntegrationCode',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice'
  ],

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.accounting.AccountingIntegrationTrait',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.xero.model.XeroInvoice',
  ],

  imports: [
    'checkAndNotifyAbilityToReceive',
    'currencyDAO',
    'notify',
    'stack',
    'user',
    'accountingIntegrationUtil',
  ],

  css: `
    ^ {
      width: 1024px;
      margin: auto;
      margin-top: 30px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-reqMoney {
      position: relative;
      left: 850px;
      top: -75px;
    }
    ^ .DAOBrowser {
      position: relative;
      top: -40px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-sync, ^ .net-nanopay-sme-ui-AbliiActionView-sync:hover:not(:disabled) {
      position: relative;
      left: 680px;
      top: -25px;
      background: none !important;
      border: none !important;
      color: grey;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-sync {
      background: none;
      border: none;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-secondary {
      border: 1px solid lightgrey;
    }
    ^ h1, h3 {
      margin: 15px;
    }
    ^ h3 {
      font-weight: 200;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Receivables' },
    { name: 'SUB_TITLE', message: `Here's a list of the funds you've requested from other people` },
    { name: 'DELETE_DRAFT', message: 'Draft has been deleted.' },
    { name: 'RECONCILED_SUCCESS', message: 'Invoice has been reconciled by payer.' },
    { name: 'RECONCILED_ERROR', message: `There was an error reconciling the invoice.` }
  ],

  classes: [
    {
      name: 'DAOBrowser',
      extends: 'foam.comics.v2.DAOBrowserView',

      imports: [
        'accountingIntegrationUtil'
      ],

      methods: [
        async function dblclick(invoice) {
          let updatedInvoice = await this.accountingIntegrationUtil.forceSyncInvoice(invoice);
          if ( updatedInvoice === null || updatedInvoice === undefined ) return;
          this.stack.push({
            class: 'net.nanopay.sme.ui.InvoiceOverview',
            invoice: updatedInvoice,
            isPayable: false
          });
        }
      ]
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({
          filterExportPredicate: this.NEQ(foam.nanos.export.ExportDriverRegistry.ID, 'CSV'),
          dao: this.user.sales.where(this.EQ(this.Invoice.PAYEE_RECONCILED, false)).orderBy(this.DESC(this.Invoice.CREATED)),
          createPredicate: foam.mlang.predicate.True,
          defaultColumns: [
            this.Invoice.PAYER_ID.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: async function(_, invoice) {
                var additiveSubField = await invoice.payer.label();
                this.add(additiveSubField);
                this.tooltip = additiveSubField;
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
          ]
        });
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
            this.Invoice.PAYER_ID.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: async function(_, invoice) {
                var additiveSubField = await invoice.payer.label();
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
              name: 'reconcile',
              label: 'Reconcile',
              isAvailable: function() {
                return ! this.payeeReconciled && this.status != this.InvoiceStatus.DRAFT;
              },
              code: async function(X) {
                this.payeeReconciled = true;
                self.user.expenses.put(this).then(() => {
                  self.notify(self.RECONCILED_SUCCESS, 'success');
                }).catch((err) => {
                  self.notify(self.RECONCILED_ERROR, 'error');
                });
              }
            }),
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
                self.user.sales.remove(this).then(() => {
                  self.notify(self.DELETE_DRAFT, 'success')
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

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
      .start('h1').add(this.TITLE).end()
      .start('h3').addClass('subdued-text').add(this.SUB_TITLE).end()
      .tag(this.primaryAction, {
        size: 'LARGE'
      })
      .startContext({ data: this })
        .tag(this.SYNC, {
          size: 'MEDIUM'
        })
      .endContext()
      .tag(this.DAOBrowser.create({
        config: this.config,
        summaryView: this.summaryView
      }));
    }
  ],
  actions: [
    {
      name: 'sync',
      label: 'Sync with Accounting',
      code: function(X) {
        this.ctrl.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    }
  ]
});
