
foam.CLASS({
  package: 'net.nanopay.b2b.ui.receivables',
  name: 'SalesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Sales Invoices.',

  requires: [ 'net.nanopay.b2b.model.Invoice' ],
  exports: [ 'hideReceivableSummary' ],

  imports: [ 'salesDAO', 'business', 'stack' ],

  properties: [ 
    'selection',
    {
      class: 'Boolean',
      name: 'hideReceivableSummary',
      value: false
    },
    { name: 'data', factory: function() { return this.salesDAO; }}
  ],

  messages: [
    {
      name: 'placeholderText',
      message: 'You don’t have any bills to pay now. When you receive an invoice from your partners, it will show up here.'
    }
  ],
  
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        ^ .foam-u2-view-TableView-net-nanopay-b2b-model-Invoice{
          position: relative;
          top: -75px;
        }
        ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 960px;
        }
        ^ thead > tr > th {
          font-family: 'Roboto';
          font-size: 14px;
          background: #dfe8ee;
          color: #093649;
          line-height: 1.14;
          letter-spacing: 0.3px;
          border-spacing: 0;
          text-align: left;
          padding-left: 15px;
        }
        ^ tbody > tr > th {
          font-size: 12px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          padding-left: 15px;
        }
        ^ .foam-u2-view-TableView th {
          padding-left: 15px;
        }
        ^ tbody > tr {
          height: 60px;
          background: white;
        }
        ^ tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }
        ^ .sync-import-div{
          margin-right: 265px;
        }
        ^ .foam-u2-ActionView-create{
          position: relative;
          top: -72px;
        }
        ^ .net-nanopay-b2b-ui-shared-summaryViews-SummaryCard{
          width: 20.9%;
        }
        .hide{
          display: none;
        }
        ^ .foam-u2-ActionView-back{
          position: absolute;
          top: 110px;
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1) !important;
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          color: black;
        }
        ^ .optionsDropDown {
          left: -117 !important;
          top: 30 !important;
        }
        */
      }
    })
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideReceivableSummary$)
          .start({class: 'net.nanopay.b2b.ui.shared.summaryViews.ReceivablesSummaryView'}).end()
          .start('div').addClass('container')
            .start('div').addClass('button-div')
              .tag({class: 'net.nanopay.b2b.ActionButton', data: {image: 'images/ic-filter.png', text: 'Filters'}})
              // .start('input').addClass('filter-search').end()
              .start('div').addClass('sync-action-div')
                .tag({class: 'net.nanopay.b2b.ActionButton', data: {image: 'images/approve.png', text: 'Pay'}})
                .start({class: 'net.nanopay.b2b.ActionButton', data: {image: 'images/dispute.png', text: 'Dispute'}}).addClass('import-button').end()
                .start({class: 'net.nanopay.b2b.ActionButton', data: {image: 'images/reject.png', text: 'Reject'}}).addClass('import-button').end()
              .end()          
              .start('div').addClass('sync-import-div')
                .tag({class: 'net.nanopay.b2b.ActionButton', data: {image: 'images/ic-sync-s.png', text: 'Sync'}})
                .start({class: 'net.nanopay.b2b.ActionButton', data: {image: 'images/ic-import.png', text: 'Import'}}).addClass('import-button').end()
              .end()
            .end()
          .end()
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.salesDAO,
            factory: function() { return self.Invoice.create({ fromBusinessId: self.business.id, fromBusinessName: self.business.name }); },
            createDetailView: { class: 'net.nanopay.b2b.ui.InvoiceDetailView' },
            detailView: { class: 'net.nanopay.b2b.ui.SalesDetailView' },
            summaryView: this.SalesTableView.create()
          })
        .end()
        .tag({ class: 'net.nanopay.b2b.ui.shared.Placeholder', dao: this.salesDAO, message: this.placeholderText, image: 'images/ic-receivable.png' })
    }
  ],

  classes: [
    {
      name: 'SalesTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.b2b.model.Invoice' ],

      imports: [ 'salesDAO' ],
      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.salesDAO; }}
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              config: {
                amount: { 
                  tableCellView: function(obj, e) {
                  return e.E().add('- $', obj.amount).style({color: '#c82e2e'})
                  }
                }
              },
              columns: [
                'invoiceNumber', 'purchaseOrder', 'fromBusinessId', 'paymentDate', 'issueDate', 'amount', 'status'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});