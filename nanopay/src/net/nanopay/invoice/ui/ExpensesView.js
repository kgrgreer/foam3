
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Expenses Invoices.',

  implements: [ 'foam.mlang.Expressions' ],

  requires: [ 'net.nanopay.invoice.model.Invoice' ],

  imports: [ 'user' ],

  exports: [ 'hideSaleSummary', 'expensesDAO' ],

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
        ^ .button-div{
          height: 40px;
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
          .start({class: 'net.nanopay.invoice.ui.PayableSummaryView'}).end()
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
            factory: function() { return self.Invoice.create({ payerId: self.user.id, payerName: self.user.name }); },
            createLabel: 'New Bill',
            createDetailView: { class: 'net.nanopay.invoice.ui.BillDetailView' },
            detailView: { class: 'net.nanopay.invoice.ui.ExpensesDetailView' },
            summaryView: this.ExpensesTableView.create(),
            showActions: false
          })
        .end()
        .start().enableClass('hide', this.hideSaleSummary$)        
          .tag({ class: 'net.nanopay.ui.Placeholder', dao: this.expensesDAO, message: this.placeholderText, image: 'images/ic-payable.png'})
        .end()
    },
  ],

  classes: [
    {
      name: 'ExpensesTableView',
      extends: 'foam.u2.View',
      
      requires: [ 'net.nanopay.invoice.model.Invoice' ],
      imports: [ 'expensesDAO' ],

      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.expensesDAO; }}
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
                    
                    return e.E().start('span').style(statusCircle).end().add(obj.status).style(statusColor);
                  }
                }
              },
              columns: [
                'invoiceNumber', 'purchaseOrder', 'payeeId', 'dueDate', 'amount', 'status'
              ],
            }).end()
        },
      ]
    }
  ]
});
