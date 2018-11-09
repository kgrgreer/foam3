// TODO: add accounting export. Button/Action 'syncButton'
// TODO: add export to csv. Button/Action 'csvButton'
// TODO: dbclick changed to single click
// TODO: associated actions with context Menu
foam.CLASS({
  package: 'net.nanopay.invoice.ui.sme',
  name: 'ReceivablesView',
  extends: 'foam.u2.Controller',

  documentation: `
    View to display a table with a list of all receivables Invoices. Also
    Exports to Accounting Software, exports to CSV, has search capabilities on
    company name column
  `,

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.sme.ui.CountTrait'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
  ],

  imports: [
    'stack',
    'user'
  ],

  exports: [
    'dblclick'
  ],

  css: `
    ^ {
      width: 1240px;
      margin: 0 auto;
    }
    ^ .searchIcon {
      position: absolute;
      margin-left: 5px;
      margin-top: 8px;
    }
    ^ .filter-search {
      width: 225px;
      height: 40px;
      border-radius: 2px;
      border: 1px solid #ddd;
      background-color: #ffffff;
      vertical-align: top;
      box-shadow:none;
      padding: 10px 10px 10px 31px;
      font-size: 14px;
    }
    ^ .subTitle {
      font-size: 9pt;
      margin-left: 18px;
      color: gray;
    }
    ^ .exportButtons {
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      cursor: pointer;
    }
    ^ table {
      width: 1240px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    ^title-and-sub > * {
      display: inline-block;
    }
  `,

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.user.sales;
      }
    },
    {
      name: 'userSalesArray',
      documentation: 'Array that is populated on class load with user.sales(receivables invoices)'
    },
    {
      name: 'filteredDAO',
      documentation: `DAO that is filtered from Search('Property filter')`,
      expression: function(filter, userSalesArray) {
        if ( filter == '' ) {
          return this.user.sales;
        }

        var filteredByCompanyInvoices = userSalesArray.filter((sale) => {
          var matches = (str) => str && str.toUpperCase().includes(filter.toUpperCase());
          return sale.payer.businessName ? matches(sale.payer.businessName) : matches(sale.payer.label());
        });

        return foam.dao.ArrayDAO.create({
          array: filteredByCompanyInvoices,
          of: 'net.nanopay.invoice.model.Invoice'
        });
      },
      view: function() {
        var Invoice = net.nanopay.invoice.model.Invoice;
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            Invoice.PAYEE.clone().copyFrom({
              label: 'Company',
              tableCellFormatter: function(_, invoice) {
                var additiveSubField = invoice.payee.businessName ?
                  invoice.payee.businessName :
                  invoice.payee.label();
                this.add(additiveSubField);
              }
            }),
            Invoice.INVOICE_NUMBER.clone().copyFrom({ label: 'Invoice No.' }),
            Invoice.AMOUNT.clone().copyFrom({
              tableCellFormatter: function(_, invoice) {
                invoice.destinationCurrency$find.then((currency) => {
                  this.add(`+ ${currency.format(invoice.amount)}`);
                });
              }
            }),
            'dueDate',
            'lastModified',
            'status'
          ]
        };
      }
    }
  ],

  messages: [
    { name: 'OBJECT_SINGULAR', message: 'receivable' },
    { name: 'OBJECT_PLURAL', message: 'receivables' },
    { name: 'TITLE', message: 'Receivables' },
    { name: 'SUB_TITLE', message: 'Money owed to you' },
    { name: 'PLACE_HOLDER_TEXT', message: 'Looks like you do not have any receivables yet. Please add a receivable by clicking one of the Quick Actions.' }
  ],

  methods: [
    function init() {
      this.data.select().then((salesSink) => {
        this.userSalesArray = salesSink.array;
      });
    },

    function initE() {
      var view = this;
      this.data.on.sub(this.updateTotalCount);
      this.updateTotalCount();
      this.filteredDAO$.sub(this.updateSelectedCount);
      this.updateSelectedCount(0, 0, 0, this.filteredDAO$);

      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('top-bar'))
          .start()
            .addClass(this.myClass('title-and-sub'))
            .start('h1').add(this.TITLE).end()
            .start().addClass('subTitle').add(this.SUB_TITLE).end()
          .end()
          .tag(this.REQ_MONEY)
        .end()
        .start()
          .tag({
            class: 'net.nanopay.integration.IntegrationSignInView',
          })
          .start(this.CSV_BUTTON, { icon: 'images/ic-export.png', showLabel: true })
            .style({ 'margin-left': '2%' }).addClass('exportButtons')
          .end()
          .start().style({ 'margin': '15px 15px 15px 0px' })
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' }).addClass('searchIcon').end()
            .start(this.FILTER).addClass('filter-search').end()
          .end()
        .end()
        .start('p').add(this.countMessage$).end()
        .tag(this.FILTERED_DAO, {
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
              name: 'sendReminder',
              label: 'Send a reminder?',
              isAvailable: function() {
                return this.status === this.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                alert('Not implemented yet!');
                // TODO: add redirect to payment flow
              }
            }),
            foam.core.Action.create({
              name: 'markVoid',
              label: 'Mark as Void',
              isEnabled: function() {
                if ( view.user.id != this.createdBy ) return false;
                return this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.OVERDUE;
              },
              isAvailable: function() {
                if ( view.user.id != this.createdBy ) return false;
                return this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.PAID ||
                  this.status === this.InvoiceStatus.PENDING ||
                  this.status === this.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                this.paymentMethod = this.PaymentStatus.VOID;
                view.user.sales.put(this);
              }
            }),
            foam.core.Action.create({
              name: 'delete',
              label: 'Delete',
              confirmationRequired: true,
              isAvailable: function() {
                return this.status === this.InvoiceStatus.DRAFT;
              },
              code: function(X) {
                view.user.sales.remove(this);
                view.totalInvoiceCount--;
                view.invoiceCount--;
              }
            })
          ]
        })
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.filteredDAO, message: this.PLACE_HOLDER_TEXT, image: 'images/ic-bankempty.svg' });
    },

    function dblclick(invoice) {
      // TODO: change dblclick to singleClick
      this.stack.push({
        class: 'net.nanopay.sme.ui.InvoiceOverview',
        invoice: invoice,
        isPayable: false
      });
    }
  ],

  actions: [
    {
      name: 'syncButton',
      label: 'sync',
      toolTip: 'Sync with accounting Software',
      code: function(X) {
        // TODO: Sync to Accounting Software
      }
    },
    {
      name: 'csvButton',
      label: 'Export as CSV',
      toolTip: 'Export list of invoices to a CSV file',
      code: function(X) {
        // TODO: Export to CSV
      }
    },
    {
      name: 'reqMoney',
      label: 'Request money',
      toolTip: 'Pay for selected invoice',
      code: function(X) {
        X.stack.push({
          class: 'net.nanopay.sme.ui.SendRequestMoney',
          invoice: this.Invoice.create({}),
          isPayable: false
        });
      }
    }
  ]
});
