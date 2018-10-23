// TODO: add accounting export. Button/Action 'syncButton'
// TODO: add export to csv. Button/Action 'csvButton'
// TODO: dbclick changed to single click
// TODO: context Menu need to add certian associated actions - see below
foam.CLASS({
  package: 'net.nanopay.invoice.ui.sme',
  name: 'PayablesView',
  extends: 'foam.u2.Controller',

  documentation: `View to display a table with a list of all Payable Invoices.
  Also Exports to Accounting Software, exports to CSV, has search capabilities on Company Name column`,

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.sme.ui.CountTrait'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
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
        return this.user.expenses;
      }
    },
    {
      name: 'userExpensesArray',
      documentation: 'Array that is populated on class load with user.expenses(payable invoices)'
    },
    {
      name: 'filteredDAO',
      documentation: `DAO that is filtered from Search('Property filter')`,
      expression: function(filter, userExpensesArray) {
        if ( filter === '' ) {
          return this.user.expenses;
        }

        var filteredByCompanyInvoices = userExpensesArray.filter((expense) => {
          var matches = (str) => str && str.toUpperCase().includes(filter.toUpperCase());
          return expense.payee.businessName ? matches(expense.payee.businessName) : matches(expense.payee.label());
        });

        return foam.dao.ArrayDAO.create({
          array: filteredByCompanyInvoices,
          of: 'net.nanopay.invoice.model.Invoice'
        });
      },
      view: function() {
        return {
          class: 'foam.u2.view.ScrollTableView',
          columns: [
            net.nanopay.invoice.model.Invoice.PAYEE.clone().copyFrom({ label: 'Company', tableCellFormatter: function(_, obj) {
              var additiveSubField = obj.payee.businessName ? obj.payee.businessName : obj.payee.label();
              this.add(additiveSubField);
            } }),
            net.nanopay.invoice.model.Invoice.INVOICE_NUMBER.clone().copyFrom({ label: 'Invoice No.' }),
            net.nanopay.invoice.model.Invoice.AMOUNT.clone().copyFrom({ tableCellFormatter: function(_, obj) {
              var additiveSubField = '- ';
              if ( obj.destinationCurrency == 'CAD' || obj.destinationCurrency == 'USD' ) additiveSubField += '$';
              additiveSubField += (obj.addCommas((obj.amount/100).toFixed(2)) + ' ' + obj.destinationCurrency);
              this.add(additiveSubField);
            } }),
            'dueDate',
            'lastModified',
            'status'
          ]
        };
      }
    }
  ],

  messages: [
    { name: 'OBJECT_SINGULAR', message: 'payable' },
    { name: 'OBJECT_PLURAL', message: 'payables' },
    { name: 'TITLE', message: 'Payables' },
    { name: 'SUB_TITLE', message: 'Money owed to vendors' },
    { name: 'PLACE_HOLDER_TEXT', message: 'Looks like you do not have any Payables yet. Please add a Payable by clicking one of the Quick Actions.' }
  ],

  methods: [
    function init() {
      var self = this;
      this.data.select().then(function(expensesSink) {
        self.userExpensesArray = expensesSink.array;
        self.totalInvoiceCount = expensesSink.array.length;
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
          .tag(this.SEND_MONEY)
        .end()
        .start()
          .start(this.SYNC_BUTTON, { icon: 'images/ic-export.png', showLabel: true })
            .addClass('exportButtons')
          .end()
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
                  class: 'net.nanopay.sme.ui.InvoiceDetailView',
                  invoice: this,
                  isPayable: true
                });
              }
            }),
            foam.core.Action.create({
              name: 'payNow',
              label: 'Pay now',
              isAvailable: function() {
                return this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                // TODO: Update the redirection to payment flow
                if ( this.paymentMethod != this.PaymentStatus.NONE ) {
                  this.add(self.NotificationMessage.create({
                    message: `${this.verbTenseMsg} ${this.paymentMethod.label}.`,
                    type: 'error'
                  }));
                  return;
                }
                X.stack.push({
                  class: 'net.nanopay.ui.transfer.TransferWizard',
                  type: 'regular',
                  invoice: this
                });
              }
            }),
            foam.core.Action.create({
              name: 'markVoid',
              label: 'Mark as Void',
              isEnabled: function() {
                return this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.OVERDUE;
              },
              isAvailable: function() {
                return this.status === this.InvoiceStatus.UNPAID ||
                  this.status === this.InvoiceStatus.PAID ||
                  this.status === this.InvoiceStatus.PENDING ||
                  this.status === this.InvoiceStatus.OVERDUE;
              },
              code: function(X) {
                this.paymentMethod = view.PaymentStatus.VOID;
                view.user.expenses.put(this);
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
                view.user.expenses.remove(this);
                view.totalInvoiceCount--;
                view.invoiceCount--;
              }
            })
          ]
        })
        .tag({
          class: 'net.nanopay.ui.Placeholder',
          dao: this.filteredDAO,
          message: this.PLACE_HOLDER_TEXT,
          image: 'images/ic-bankempty.svg'
        });
    },

    function dblclick(invoice) {
      // TODO: change dblclick to singleClick
      this.stack.push({
        class: 'net.nanopay.sme.ui.InvoiceDetailView',
        invoice: invoice,
        isPayable: true
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
      name: 'sendMoney',
      label: 'Send money',
      toolTip: 'Pay for selected invoice',
      code: function(X) {
        // TODO: Need to replace the redirect
        X.stack.push({
          class: 'net.nanopay.sme.ui.SendRequestMoney',
          invoice: this.Invoice.create({}),
          isPayable: true,
        });
      }
    }
  ]
});

