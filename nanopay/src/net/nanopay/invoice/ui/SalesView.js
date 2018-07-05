
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SalesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Sales Invoices.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.ui.ReceivablesSummaryView',
  ],

  imports: [
    'user',
    'stack'
  ],

  exports: [
    'hideReceivableSummary',
    'salesDAO'
  ],

  properties: [
    'selection',
    {
      class: 'Boolean',
      name: 'hideReceivableSummary',
      value: false
    },
    {
      name: 'salesDAO',
      factory: function() {
        return this.user.sales;
      }
    },
    {
      name: 'tableView',
      factory: function() {
        return this.SalesTableView.create();
      }
    },
    {
      name: 'summaryView',
      factory: function() {
        var view = this.ReceivablesSummaryView.create();
        view.sub('statusChange', this.updateTableDAO);
        view.sub('statusReset', this.resetTableDAO);
        return view;
      }
    }
  ],

  messages: [
    {
      name: 'placeholderText',
      message: 'You haven’t sent any invoices yet. After you send an invoice ' +
          'to your partners, it will show up here.'
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
      left: -117 !important;
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
    ^ .foam-u2-ListCreateController{
      top: 30px;
      position: relative;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideReceivableSummary$)
          .add(this.summaryView)
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.salesDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE)),
            createLabel: 'New Invoice',
            createDetailView: {
              class: 'net.nanopay.invoice.ui.InvoiceDetailView'
            },
            detailView: { class: 'net.nanopay.invoice.ui.SalesDetailView' },
            summaryView: this.tableView,
            showActions: false
          })
        .end()
        .start().enableClass('hide', this.hideReceivableSummary$)
          .tag({
            class: 'net.nanopay.ui.Placeholder',
            dao: this.salesDAO,
            message: this.placeholderText,
            image: 'images/ic-receivable.png'
          })
        .end();
    }
  ],

  listeners: [
    {
      name: 'updateTableDAO',
      code: function(_, __, newStatus) {
        this.tableView.data = this.salesDAO
            .where(this.EQ(this.Invoice.STATUS, newStatus))
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    },
    {
      name: 'resetTableDAO',
      code: function() {
        this.tableView.data = this.salesDAO
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    }
  ],

  classes: [
    {
      name: 'SalesTableView',
      extends: 'foam.u2.View',

      requires: [
        'net.nanopay.invoice.model.Invoice'
      ],

      imports: [
        'salesDAO',
        'hideSaleSummary'
      ],

      exports: [
        'selection'
      ],

      properties: [
        'selection',
        {
          name: 'data',
          factory: function() {
            return this.salesDAO;
          }
        }
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.ScrollTableView',
              selection$: this.selection$,
              data$: this.data$,
              config: {
                amount: {
                  tableCellView: function(obj, e) {
                    return e.E()
                        .add('- $', obj.amount)
                        .style({ color: '#c82e2e' });
                  }
                }
              },
              columns: [
                'id', 'invoiceNumber', 'purchaseOrder', 'payerId', 'dueDate',
                'amount', 'status'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ],
    }
  ]
});
