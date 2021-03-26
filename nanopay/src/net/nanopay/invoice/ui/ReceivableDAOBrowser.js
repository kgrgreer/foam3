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
  package: 'net.nanopay.invoice.ui',
  name: 'ReceivableDAOBrowser',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.v2.DAOControllerConfig',
    'foam.core.Action',
    'foam.log.LogLevel',
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
    'stack',
    'subject',
    'accountingIntegrationUtil',
  ],

  css: `
    ^ {
      margin: auto;
      padding: 32px;
    }
    ^row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }
    ^ .DAOBrowser {
      position: relative;
    }
    ^ .foam-u2-ActionView-sync, ^ .foam-u2-ActionView-sync:hover:not(:disabled) {
      background: none !important;
      border: none !important;
      color: grey;
    }
    ^ .foam-u2-ActionView-sync {
      background: none;
      border: none;
    }
    ^ .foam-u2-ActionView-secondary {
      border: 1px solid lightgrey;
    }
    ^ h3 {
      font-weight: 200;
    }
    ^ .DAOBrowser .foam-u2-filter-BooleanFilterView-container .foam-u2-md-CheckBox:checked {
      background-color: /*%WHITE%*/ #ffffff;
      border-color: /*%WHITE%*/ #ffffff;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Receivables' },
    { name: 'SUB_TITLE', message: `Here's a list of the funds you've requested from other people` },
    { name: 'DELETE_DRAFT', message: 'Draft has been deleted' },
    { name: 'RECONCILED_SUCCESS', message: 'Invoice has been reconciled by payer' },
    { name: 'RECONCILED_ERROR', message: `There was an error reconciling the invoice` },
    { name: 'INVOICE', message: 'invoice' }
  ],

  classes: [
    {
      name: 'DAOBrowser',
      extends: 'foam.comics.v2.DAOBrowserView',

      imports: [
        'accountingIntegrationUtil'
      ],

      exports: [
        'click',
      ],

      methods: [
        function click(obj, id, X) {
          let updatedInvoice = X.accountingIntegrationUtil.forceSyncInvoice(this);
          X.stack.push({
            class: 'net.nanopay.sme.ui.InvoiceOverview',
            invoice: updatedInvoice,//this
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
          dao: this.subject.user.sales.orderBy(this.Invoice.PAYEE_RECONCILED, this.Invoice.PAYER_RECONCILED, this.DESC(this.Invoice.ISSUE_DATE)),
          createPredicate: foam.mlang.predicate.True,
          defaultColumns: [
            this.Invoice.PAYER_ID.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payer.toSummary();
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
          dblClickListenerAction: async function dblclick(invoice, id) {
            if ( ! invoice ) invoice = await this.__subContext__.invoiceDAO.find(id);
            let updatedInvoice = await this.accountingIntegrationUtil.forceSyncInvoice(invoice);
            if ( updatedInvoice === null || updatedInvoice === undefined ) return;
            this.stack.push({
              class: 'net.nanopay.sme.ui.InvoiceOverview',
              invoice: updatedInvoice,
              isPayable: false
            });
          },
          columns: [
            this.Invoice.PAYER_ID.clone().copyFrom({
              label: 'Company',
              name: 'organization',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payer.toSummary();
                this.add(additiveSubField);
              }
            }),
            this.Invoice.INVOICE_NUMBER.clone().copyFrom({
              label: 'Invoice No.',
              name: 'invoiceNumber',
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
                return ! this.payeeReconciled && this.status === this.InvoiceStatus.PAID;
              },
              code: async function(X) {
                this.payeeReconciled = true;
                self.subject.user.expenses.put(this).then(() => {
                  self.notify(self.RECONCILED_SUCCESS, '', self.LogLevel.INFO, true);
                }).catch((err) => {
                  self.notify(self.RECONCILED_ERROR, '', self.LogLevel.ERROR, true);
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
                if ( self.subject.user.id != this.createdBy ) return false;
                return this.status === self.InvoiceStatus.UNPAID ||
                  this.status === self.InvoiceStatus.OVERDUE;
              },
              isAvailable: function() {
                if ( self.subject.user.id != this.createdBy ) return false;
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
                ctrl.add(self.Popup.create().tag({
                  class: 'foam.u2.DeleteModal',
                  dao: self.subject.user.sales,
                  data: this,
                  label: self.INVOICE
                }));
              }
            })
          ]
        };
      }
    },
    {
      name: 'primaryAction',
      factory: function() { return this.REQ_MONEY; }
    }
  ],

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
      .start('div').addClass(this.myClass('row'))
        .start('h1').add(this.TITLE).end()
        .tag(this.primaryAction, {
          size: 'LARGE'
        })
      .end()
      /*.start('div').addClass(this.myClass('row'))
        .start('h3').addClass('subdued-text').add(this.SUB_TITLE).end()
        .startContext({ data: this })
          .tag(this.SYNC, {
            size: 'MEDIUM'
          })
        .endContext()
      .end()*/
      .tag(this.DAOBrowser.create({
        config: this.config,
        summaryView: this.summaryView
      }));
    }
  ],
  actions: [
    {
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
    },
    /*{
      name: 'sync',
      label: 'Sync with Accounting',
      isAvailable: async function() {
        var permissions = await this.accountingIntegrationUtil.getPermission();
        return permissions[0];
      },
      code: function(X) {
        this.ctrl.add(this.Popup.create().tag({
          class: 'net.invoice.ui.modal.IntegrationModal'
        }));
      }
    }*/
  ]
});
