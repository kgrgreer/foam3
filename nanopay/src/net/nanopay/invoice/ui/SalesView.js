
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
    'net.nanopay.invoice.ui.InvoiceSummaryView',
  ],

  imports: [
    'user',
    'stack'
  ],

  exports: [
    'hideSummary',
    'salesDAO'
  ],

  properties: [
    'selection',
    {
      name: 'summaryView',
      documentation: `A named reference to the summary view so we can subscribe
          to events emitted from it.`,
    },
    {
      class: 'Boolean',
      name: 'hideSummary',
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
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      factory: function() {
        return this.salesDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
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
        .start().enableClass('hide', this.hideSummary$)
          .tag(this.InvoiceSummaryView, {
            sumLabel: 'Receivables',
            dao: this.user.sales
          }, this.summaryView$)
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.filteredDAO$proxy,
            createLabel: 'New Invoice',
            createDetailView: {
              class: 'net.nanopay.invoice.ui.InvoiceDetailView'
            },
            detailView: { class: 'net.nanopay.invoice.ui.SalesDetailView' },
            summaryView: this.SalesTableView,
            showActions: false
          })
        .end()
        .start().enableClass('hide', this.hideSummary$)
          .tag({
            class: 'net.nanopay.ui.Placeholder',
            dao: this.salesDAO,
            message: this.placeholderText,
            image: 'images/ic-receivable.png'
          })
        .end();

      // When a SummaryCard is clicked on, it will toggle between two states:
      // active and inactive. When it changes state it will emit one of the two
      // following events. We subscribe to them here and update the table view
      // based on the card that was selected.
      this.summaryView.statusChange.sub(this.updateTableDAO);
      this.summaryView.statusReset.sub(this.resetTableDAO);
    }
  ],

  listeners: [
    {
      name: 'updateTableDAO',
      code: function(_, __, newStatus) {
        this.filteredDAO = this.salesDAO
            .where(this.EQ(this.Invoice.STATUS, newStatus))
            .orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    },
    {
      name: 'resetTableDAO',
      code: function() {
        this.filteredDAO = this.salesDAO
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
        'hideSummary'
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
                'invoiceNumber', 'purchaseOrder', 'payerId', 'dueDate',
                'amount', 'status'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ],
    }
  ]
});
