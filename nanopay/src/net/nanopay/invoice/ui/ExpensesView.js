
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Expenses Invoices.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.ui.BillDetailView',
    'net.nanopay.invoice.ui.ExpensesDetailView',
    'net.nanopay.invoice.ui.PayableSummaryView'
  ],

  imports: [
    'user'
  ],

  exports: [
    'hideSaleSummary'
  ],

  properties: [
    'selection',
    {
      class: 'Boolean',
      name: 'hideSaleSummary',
      value: false
    },
    {
      name: 'expensesDAO',
      factory: function() {
        return this.user.expenses;
      }
    },
    {
      name: 'tableView',
      factory: function() {
        return this.ExpensesTableView.create();
      }
    },
    {
      name: 'summaryView',
      factory: function() {
        var view = this.PayableSummaryView.create();
        view.sub('statusChange', this.updateTableDAO);
        view.sub('statusReset', this.resetTableDAO);
        return view;
      }
    },
    {
      name: 'billDetailView',
      factory: function() {
        return this.BillDetailView.create();
      }
    },
    {
      name: 'expensesDetailView',
      factory: function() {
        return this.ExpensesDetailView.create();
      }
    }
  ],

  css: `
    ^{
      width: 970px;
      margin: auto;
    }
    ^ .net-nanopay-invoice-ui-SummaryCard{
      width: 15.8%;
    }
    ^ .optionsDropDown {
      left: -92 !important;
      top: 30 !important;
    }
    ^ .net-nanopay-ui-ActionView-create{
      position: relative;
      top: -32;
      margin-right: 5px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: %TABLEHOVERCOLOR%;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    ^ .button-div{
      height: 40px;
    }
    ^ .foam-u2-view-TableView td{
      width: 8px;
    }
  `,

  messages: [
    {
      name: 'placeholderText',
      message: 'You don’t have any bills to pay now. When you receive an ' +
          'invoice from your partners, it will show up here.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideSaleSummary$)
          .add(this.summaryView)
          .start().addClass('container')
            .start().addClass('button-div')
              // .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-filter.png', text: 'Filters'}})
              // .start().addClass('inline')
              //   .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/approve.png', text: 'Pay'}})
              //   .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/dispute.png', text: 'Dispute'}}).addClass('import-button').end()
              //   .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/reject.png', text: 'Reject'}}).addClass('import-button').end()
              // .end()
              // .start().addClass('inline')
              //   .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-sync-s.png', text: 'Sync'}})
              //   .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-import.png', text: 'Import'}}).addClass('import-button').end()
              // .end()
            .end()
          .end()
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.expensesDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE)),
            createLabel: 'New Bill',
            createDetailView: this.billDetailView,
            detailView: this.expensesDetailView,
            summaryView: this.tableView,
            showActions: false
          })
        .end()
        .start()
          .enableClass('hide', this.hideSaleSummary$)
          .tag({
            class: 'net.nanopay.ui.Placeholder',
            dao: this.expensesDAO,
            message: this.placeholderText,
            image: 'images/ic-bankempty.svg'
          })
        .end();
    },
  ],

  listeners: [
    {
      name: 'updateTableDAO',
      code: function(_, __, newStatus) {
        this.tableView.data = this.expensesDAO
            .where(this.EQ(this.Invoice.STATUS, newStatus))
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    },
    {
      name: 'resetTableDAO',
      code: function() {
        this.tableView.data = this.expensesDAO
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    }
  ],

  classes: [
    {
      name: 'ExpensesTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.invoice.model.Invoice'
      ],

      imports: [
        'expensesDAO'
      ],

      exports: [
        'selection'
      ],

      properties: [
        'selection',
        {
          name: 'data',
          factory: function() {
            return this.expensesDAO;
          }
        }
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              selection$: this.selection$,
              data$: this.data$,
              config: {
                amount: {
                  tableCellView: function(obj, e) {
                    return e.E()
                        .add('+ $', obj.amount)
                        .style({ color: '#2cab70' });
                  }
                },
                status: {
                  tableCellView: function(obj, e) {
                    var statusCircle = obj.status == 'Scheduled'
                        ? { border: '3px solid #59a5d5' }
                        : {
                            border: '3px solid #2cab70',
                            background: '#2cab70'
                          };

                    var statusColor = obj.status == 'Scheduled'
                        ? { color: '#59a5d5' }
                        : { color: '#2cab70' };

                    return e.E()
                        .start('span')
                          .style(statusCircle)
                        .end()
                        .add(obj.status)
                        .style(statusColor);
                  }
                }
              },
              columns: [
                'id', 'invoiceNumber', 'purchaseOrder', 'payeeId', 'dueDate',
                'amount', 'status'
              ],
            }).end();
        }
      ]
    }
  ]
});
