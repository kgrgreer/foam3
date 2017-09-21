
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SalesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Sales Invoices.',

  requires: [ 'net.nanopay.invoice.model.Invoice' ],

  imports: [ 'user', 'stack' ],

  exports: [ 'hideReceivableSummary', 'salesDAO' ],  

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
    }
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
        ^ .net-nanopay-invoice-ui-SummaryCard{
          width: 20.9%;
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
      this.SUPER();      
      var self = this;

      this
        .addClass(this.myClass())
        .start().enableClass('hide', this.hideReceivableSummary$)
          .start({class: 'net.nanopay.invoice.ui.ReceivablesSummaryView'}).end()
          .start().addClass('container')
            .start().addClass('button-div')
              .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-filter.png', text: 'Filters'}})
              .start().addClass('inline')
                .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/approve.png', text: 'Pay'}})
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/dispute.png', text: 'Dispute'}}).addClass('import-button').end()
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/reject.png', text: 'Reject'}}).addClass('import-button').end()
              .end()          
              .start().addClass('inline')
                .tag({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-sync-s.png', text: 'Sync'}})
                .start({class: 'net.nanopay.ui.ActionButton', data: {image: 'images/ic-import.png', text: 'Import'}}).addClass('import-button').end()
              .end()
            .end()
          .end()
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.salesDAO,
            factory: function() { return self.Invoice.create({ toUserId: self.user.id, toUserName: self.user.name }); },
            createDetailView: { class: 'net.nanopay.invoice.ui.InvoiceDetailView' },
            detailView: { class: 'net.nanopay.invoice.ui.SalesDetailView' },
            summaryView: this.SalesTableView.create()
          })
        .end()
        .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.salesDAO, message: this.placeholderText, image: 'images/ic-receivable.png' })
    }
  ],

  classes: [
    {
      name: 'SalesTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.invoice.model.Invoice' ],

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
                'invoiceNumber', 'purchaseOrder', 'fromUserId', 'paymentDate', 'issueDate', 'amount', 'status'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});