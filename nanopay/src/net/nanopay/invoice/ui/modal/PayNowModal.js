
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'PayNowModal',
  extends: 'foam.u2.Controller',

  documentation: 'Pay Now Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  properties: [
    'invoice',
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*    
      ^{
        width: 448px;
        margin: auto;
        font-family: Roboto;
      }
    */}
    })
  ],
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;
      
      this
      .tag(this.ModalHeader.create({
        title: 'Pay Now'
      }))
      .addClass(this.myClass())
        .start()
          .start().addClass('key-value-container')
            .start()
              .start().addClass('key').add("Company").end()
              .start().addClass('value').add(this.invoice.payeeName).end()
            .end()
            .start()
              .start().addClass('key').add("Amount").end()
              .start().addClass('value').add(this.invoice.currencyType, ' ', (this.invoice.amount/100).toFixed(2)).end()
            .end()
          .end()
          .start().addClass('label').add("Payment Method").end()
          .start('select').addClass('full-width-input').end()
          .start().addClass('label').add("Note").end()
          .start(this.NOTE).addClass('input-box').end()
          .start(this.PAY).addClass('blue-button btn').end()
        .end()
      .end()
    } 
  ],

  actions: [
    {
      name: 'pay',
      label: 'Pay Now',
      code: function(X){
        /* 
          Create transaction & continue flow here.
          Invoice Data is accessible through X.data.invoice
        */ 
        X.closeDialog();
      }
    }
  ]
})