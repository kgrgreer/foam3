
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'RecordPaymentModal',
  extends: 'foam.u2.View',

  documentation: 'Record Payment Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  properties: [
    {
      class: 'Date',
      name: 'paymentDate'
    },
    'amount',
    'note',
    'invoice'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
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
        title: 'Record Payment'
      }))
      .addClass(this.myClass())
      .start()
        .start().addClass('key-value-container')
          .start()
            .start().addClass('key').add('Company').end()
            .start().addClass('value').add('360 Design Inc').end()
          .end()
        .end()
        .start()
          .start().addClass('label').add('Payment Date').end()
          .start(this.PAYMENT_DATE).addClass('full-width-input').end()
        .end()
        .start()
          .start().addClass('label').add('Amount').end()
          .start(this.AMOUNT).addClass('full-width-input').end()
        .end()
        .start()
          .start().addClass('label').add('Note').end()
          .start(this.NOTE).addClass('input-box').end()
        .end()
        .start().addClass('blue-button').add('Record Payment').end()
      .end()
    } 
  ]
})