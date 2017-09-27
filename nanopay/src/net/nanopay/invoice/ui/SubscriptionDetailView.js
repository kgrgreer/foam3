foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionDetailView',
  extends: 'foam.u2.View',

  documentation: "Edit View for Recurring Invoices.",

  requires: [ 
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice'
  ],

  imports: [
    'recurringInvoiceDAO',
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        ^view-invoices{
          width: 303px;
          height: 30px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.19);
          margin: auto;
        }
        ^ .link{
          margin: 6px 20px;
          font-size: 12px;
        }
        ^ .arrow-down{
          position: relative;
          top: 10px;
          right: 15px;
        }
        ^ .light-roboto-h2{
          font-size: 18px;
          width: 500px;
        }
        ^ .blue-button{
          margin-right: 40px;
        }
        ^ .grey-button{
          margin: 20px 20px;
        }
        ^ .white-blue-button{
          margin: 20px 20px;
        }
        */
      }
    })
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('button-row')
          .start(this.BACK_ACTION).addClass('grey-button').end()
          .start(this.MODIFY).addClass('float-right blue-button').end()
          .start(this.CANCEL_SUBSCRIPTION).addClass('float-right white-blue-button').end()
        .end() 
        .start()
        .add('Recurring Invoice for ', this.data.payerName).addClass('light-roboto-h2')
        .end()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleSubscriptionView', data: this.data })
        .start().addClass(this.myClass('view-invoices'))
          .start().add('View Past Invoices').addClass('link inline').end()
          .start().addClass('arrow-down inline float-right').end()
        .end()
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.SubscriptionView' })
      }
    },
    {
      name: 'cancelSubscription',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.SubscriptionView' })        
      }
    },
    {
      name: 'modify',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.SubscriptionView' })        
      }
    }
  ]
});