foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionView',
  extends: 'foam.u2.View',

  documentation: "Summary View of User' Recurring Invoices.",

  requires: [ 
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice'
  ],

  imports: [
    'recurringInvoiceDAO',
    'invoiceDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
          margin-top: 25px;
        }
        ^ .net-nanopay-ui-ActionView-create{
          display: none;
        }
        */
      }
    })
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      var r, i;
      
      this.recurringInvoiceDAO.select().then(function(a){ 
        r = a.array[0]
        self.invoiceDAO.select().then(function(a){
          i = a.array[0]
          i.recurringInvoice = r;
        })
      });

      this
        .addClass(this.myClass())
        // .start().add('Subscriptions').addClass('light-roboto-h2').end()
        .tag({
          class: 'foam.u2.ListCreateController',
          dao: this.recurringInvoiceDAO,
          createDetailView: { class: 'net.nanopay.invoice.ui.SubscriptionEditView' },
          detailView: { class: 'net.nanopay.invoice.ui.SubscriptionDetailView' },
          summaryView: this.SubscriptionTableView.create(),
          showActions: false            
        })
    }
  ],

  classes: [
    {
      name: 'SubscriptionTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.invoice.model.RecurringInvoice' ],

      imports: [ 'recurringInvoiceDAO' ],
      properties: [ 
        'selection', 
        { name: 'data', factory: function() { return this.recurringInvoiceDAO; }}
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
                'id', 'payerName', 'nextInvoiceDate', 'amount', 'frequency', 'endsAfter', 'status'
              ]
            }).addClass(this.myClass('table')).end()
        }
      ],
    }
  ]
});