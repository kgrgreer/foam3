
foam.CLASS({
  package: 'net.nanopay.invoice.ui.payables',
  name: 'ExpensesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Expenses Invoices.',

  requires: [ 'net.nanopay.invoice.model.Invoice' ],

  imports: [ 'invoiceDAO', 'user' ],

  exports: [ 'hideSaleSummary' ],

  properties: [ 
    'selection', 
    {
      class: 'Boolean',
      name: 'hideSaleSummary',
      value: false
    },
    { name: 'data', factory: function() { return this.invoiceDAO; }}
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
          position: relative;
        }
        ^ .foam-u2-view-TableView-net-nanopay-b2b-model-Invoice{
          position: relative;
          top: -75px;
        }
        .foam-u2-ActionView-create{
          background: #59aadd;
          width: 135px;
          height: 39px;
          border-radius: 2px;
          font-size: 14px;
          letter-spacing: 0.2px;
          margin-bottom: 25px;
        }
        ^ .sync-import-div {
          margin-right: 260px;
        }
        ^ .foam-u2-ActionView-create{
          position: relative;
          top: -73;
        }
        ^ .net-nanopay-b2b-ui-shared-summaryViews-SummaryCard{
          width: 20.9%;
        }
        .sync-action-div{
          display: inline-block;
          margin-left: 10px;
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
        ^ .net-nanopay-invoice-ui-summaryViews-SummaryCard{
          width: 16.5%;
        }
        .import-button{
          padding-right: 8px;
        }
        ^ .foam-u2-ActionView-back{
          position: absolute;
          top: -2px;
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1) !important;
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          color: black;
        }
        ^ .optionsDropDown {
          left: -92 !important;
          top: 30 !important;
        }
        */
      }
    })
  ], 

  messages: [
    {
      name: 'placeholderText',
      message: 'You don’t have any bills to pay now. When you receive an invoice from your partners, it will show up here.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideSaleSummary$)
          .start({class: 'net.nanopay.invoice.ui.summaryViews.PayableSummaryView'}).end()
          .start('div').addClass('container')
            .start('div').addClass('button-div')
              .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-filter.png', text: 'Filters'}})
              // .start('input').addClass('filter-search').end()
              .start('div').addClass('sync-action-div')
                .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/approve.png', text: 'Pay'}})
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/dispute.png', text: 'Dispute'}}).addClass('import-button').end()
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/reject.png', text: 'Reject'}}).addClass('import-button').end()
              .end()          
              .start('div').addClass('sync-import-div')
                .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-sync-s.png', text: 'Sync'}})
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-import.png', text: 'Import'}}).addClass('import-button').end()
              .end()
            .end()
          .end()
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.invoiceDAO,
            factory: function() { return self.Invoice.create({ toUserId: self.user.id, toUserName: self.user.name }); },
            createLabel: 'New Invoice',
            createDetailView: { class: 'net.nanopay.invoice.ui.detailViews.BillDetailView' },
            detailView: { class: 'net.nanopay.invoice.ui.detailViews.ExpensesDetailView' },
            summaryView: this.ExpensesTableView.create()
          })
        .end()
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.invoiceDAO, message: this.placeholderText, image: 'images/ic-payable.png'})
    },
  ],

  actions: [
    function save(X) {
    }
  ],

  classes: [
    {
      name: 'ExpensesTableView',
      extends: 'foam.u2.View',
      
      requires: [ 'net.nanopay.invoice.model.Invoice' ],
      imports: [ 'invoiceDAO' ],

      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.invoiceDAO; }}
      ],

      methods: [
        function initE() {
          this.SUPER();

          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              config: {
                amount: { 
                  tableCellView: function(obj, e) {
                    return e.E().add('+ $', obj.amount).style({color: '#2cab70'})
                  } 
                },
                status: { 
                  tableCellView: function(obj, e) {
                    var statusCircle = obj.status == 'Scheduled' ? { border: '3px solid #59a5d5' } : 
                    { border: '3px solid #2cab70', background: '#2cab70'};

                    var statusColor = obj.status == 'Scheduled' ? { color: '#59a5d5'} : { color: '#2cab70'};
                    
                    return e.E().addClass('recievable-status').start('span').style(statusCircle).end().add(obj.status).style(statusColor);
                  }
                }
              },
              columns: [
                'invoiceNumber', 'purchaseOrder', 'toBusinessId', 'issueDate', 'amount', 'status'
              ],
            }).end()
        },
      ]
    }
  ]
});
