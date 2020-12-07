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
  name: 'PayableDAOBrowser',
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
    'checkAndNotifyAbilityToPay',
    'currencyDAO',
    'stack',
    'subject',
    'accountingIntegrationUtil',
  ],

  css: `
    ^ {
      margin: 30px auto 0 auto;
      padding: 0 32px;
    }
    ^top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    ^label-subtitle {
      color: #9ba1a6;
      font-size: 18px;
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
      background: none;
      border: none;
      color: grey;
    }
    ^ .foam-u2-ActionView-secondary {
      border: 1px solid lightgrey;
    }
    ^ h1 {
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
    }
    ^ .DAOBrowser .foam-u2-filter-BooleanFilterView-container .foam-u2-md-CheckBox:checked {
      background-color: /*%WHITE%*/ #ffffff;
      border-color: /*%WHITE%*/ #ffffff;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Payables' },
    { name: 'SUB_TITLE', message: `Here's a list of payments you've sent` },
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
          dao: this.subject.user.expenses.orderBy(this.Invoice.PAYER_RECONCILED, this.Invoice.PAYEE_RECONCILED, this.DESC(this.Invoice.ISSUE_DATE)),
          createPredicate: foam.mlang.predicate.True,
          defaultColumns: [
            this.Invoice.PAYEE_ID.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payee.toSummary();
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
          dblClickListenerAction: async function dblClick(invoice, id) {
            if ( ! invoice ) invoice = await this.__subContext__.invoiceDAO.find(id);
            let updatedInvoice = await self.accountingIntegrationUtil.forceSyncInvoice(invoice);
            if ( updatedInvoice === null || updatedInvoice === undefined ) return;
            self.stack.push({
              class: 'net.nanopay.sme.ui.InvoiceOverview',
              invoice: updatedInvoice,
              isPayable: true
            });
          },
          contextMenuActions: [
            this.RECONCILE,
            this.VIEW_DETAILS,
            this.PAY_NOW,
            this.EDIT,
            this.APPROVE,
            this.MARK_VOID,
            this.DELETE
          ]
        };
      }
    },
    {
      name: 'primaryAction',
      factory: function() { return this.SEND_MONEY; }
    }
  ],

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
      .start()
        .start().addClass(this.myClass('top-row'))
          .start('h1').add(this.TITLE).end()
          .start()
            .startContext({ data: this })
              .tag(this.primaryAction, {
                size: 'LARGE'
              })
            .endContext()
          .end()
        .end()
        .start().addClass(this.myClass('label-subtitle')).add(this.SUB_TITLE).end()
      .end()
      .start()
        .startContext({ data: this })
          .tag(this.IMPORT_FROM_GOOGLE_SHEETS, {
            size: 'MEDIUM'
          })
        .endContext()
        .startContext({ data: this })
          .tag(this.SYNC, {
            size: 'MEDIUM'
          })
        .endContext()
      .end()
      .tag(this.DAOBrowser.create({
        config: this.config,
        summaryView: this.summaryView,
        serviceName: 'invoiceDAO'
      }));
    }
  ],
  actions: [
    {
      name: 'sendMoney',
      label: 'Send payment',
      code: function(X) {
        this.checkAndNotifyAbilityToPay().then((result) => {
          if ( result ) {
            X.menuDAO.find('sme.quickAction.send').then((menu) => {
              var clone = menu.clone();
              Object.assign(clone.handler.view, {
                invoice: this.Invoice.create({}),
                isPayable: true,
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
    {
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
    },
    {
      name: 'reconcile',
      label: 'Reconcile',
      isAvailable: function() {
        var self = this.private_;
        return ! this.payerReconciled && this.status === this.InvoiceStatus.PAID;
      },
      code: async function(X) {
        this.payerReconciled = true;
        self.subject.user.expenses.put(this).then(() => {
          self.notify(self.RECONCILED_SUCCESS, '', self.LogLevel.INFO, true);
        }).catch((err) => {
          self.notify(self.RECONCILED_ERROR, '', self.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'viewDetails',
      label: 'View details',
      code: async function(X) {
        let updatedInvoice = await X.accountingIntegrationUtil.forceSyncInvoice(this);
        X.stack.push({
          class: 'net.nanopay.sme.ui.InvoiceOverview',
          invoice: updatedInvoice,
          isPayable: true
        });
      }
    },
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function() {
        var self = this.private_;
        return this.status === self.InvoiceStatus.UNPAID ||
          this.status === self.InvoiceStatus.OVERDUE;
      },
      code: async function(X) {
        let updatedInvoice = await X.accountingIntegrationUtil.forceSyncInvoice(this);

        if (! updatedInvoice) {
          return;
        }
        self.checkAndNotifyAbilityToPay().then((result) => {
          if ( result ) {
            X.menuDAO.find('sme.quickAction.send').then((menu) => {
              var clone = menu.clone();
              Object.assign(clone.handler.view, {
                invoice: updatedInvoice,
                isForm: false,
                isList: false,
                isDetailView: true,
                isPayable: true
              });
              clone.launch(X, X.controllerView);
            });
          }
        });
      }
    },
    {
      name: 'edit',
      label: 'Edit',
      confirmationRequired: true,
      isAvailable: function() {
        var self = this.private_;
        return this.status === self.InvoiceStatus.DRAFT;
      },
      code: function(X) {
        X.menuDAO.find('sme.quickAction.send').then((menu) => {
          var clone = menu.clone();
          Object.assign(clone.handler.view, {
            isPayable: true,
            isForm: true,
            isDetailView: false,
            invoice: this
          });
          clone.launch(X, X.controllerView);
        });
      }
    },
    {
      name: 'approve',
      isAvailable: function() {
        var self = this.private_;
        return this.status === self.InvoiceStatus.PENDING_APPROVAL;
      },
      availablePermissions: ['business.invoice.pay', 'user.invoice.pay'],
      code: function(X) {
        X.menuDAO.find('sme.quickAction.send').then((menu) => {
          var clone = menu.clone();
          Object.assign(clone.handler.view, {
            isApproving: true,
            isForm: false,
            isDetailView: true,
            invoice: this
          });
          clone.launch(X, X.controllerView);
        }).catch((err) => {
          console.warn('Error occurred when redirecting to approval payment flow: ', err);
        });
      }
    },
    {
      name: 'markVoid',
      label: 'Mark as Void',
      isEnabled: function() {
      var self = this.private_;
        return this.__subContext__.subject.user.id === this.createdBy &&
          ( this.status === self.InvoiceStatus.UNPAID ||
          this.status === self.InvoiceStatus.OVERDUE ||
          this.status === self.InvoiceStatus.PENDING_APPROVAL ) && !
          ( self.QuickbooksInvoice.isInstance(this) || self.XeroInvoice.isInstance(this) );
      },
      isAvailable: function() {
        var self = this.private_;
        return this.status === self.InvoiceStatus.UNPAID ||
          this.status === self.InvoiceStatus.PAID ||
          this.status === self.InvoiceStatus.PROCESSING ||
          this.status === self.InvoiceStatus.OVERDUE ||
          this.status === self.InvoiceStatus.PENDING_APPROVAL;
      },
      code: function() {
        var self = this.__subContext__.data;
        self.ctrl.add(self.Popup.create().tag({
          class: 'net.nanopay.invoice.ui.modal.MarkAsVoidModal',
          invoice: this
        }));
      }
    },
    {
      name: 'delete',
      label: 'Delete',
      confirmationRequired: true,
      isAvailable: function() {
        var self = this.private_;
        return this.status === self.InvoiceStatus.DRAFT;
      },
      code: function() {
        var self = this.__subContext__.data;
        ctrl.add(self.Popup.create().tag({
          class: 'foam.u2.DeleteModal',
          dao: self.subject.user.expenses,
          data: this,
          label: self.INVOICE
        }));
      }
    }
  ]
});
