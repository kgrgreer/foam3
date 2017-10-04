
foam.CLASS({
  package: 'net.nanopay.b2b.ui.modals',
  name: 'RecordPaymentModal',
  extends: 'foam.u2.View',

  documentation: 'Record Payment Modal',

  requires: [
    'net.nanopay.b2b.ui.modals.ModalHeader'
  ],

  properties: [
    {
      class: 'Date',
      name: 'paymentDate'
    },
    'amount',
    'note'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        height: 425px;
        width: 448px;
        margin: auto;
        padding-bottom: 20px;
      }
      ^ .Email-Container{
        display: flex;
      }
      ^ .Email-Text{
        margin-right: 0 !important;
      }
      ^ .Email-Container > img{
        position: relative;
        left: 290px;
        top: 4px;
      }
      ^ .foam-u2-ActionView-close{
        bottom: 0px !important;
        right: -245px !important;
      }
      ^ h4{
        display: inline-block;
        margin-left: 20px;
      }
      ^ p{
        display: inline-block;
        margin-left: 50px;
      }
      .s1-input-container > .message{
        height: 65px;
      }
      ^ .confirm-button{
        top: 25px;
        right: 30px;
        font-weight: 200;
      }
      ^ .payment-date{
        margin-top: 5px;
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
        .start()
          .start('h4').add('Company').end()
          .start('p').add('360 Design Inc').end()
        .end()
        .start().addClass('s1-input-container payment-date')
          .start('label').add('Payment Date').end()
          .start(this.PAYMENT_DATE).end()
        .end()
        .start().addClass('s1-input-container')
          .start('label').add('Amount').end()
          .start(this.AMOUNT).end()
        .end()
        .start().addClass('s1-input-container')
          .start('label').add('Note').end()
          .start(this.NOTE).addClass('message').end()
        .end()
        .start().addClass('confirm-button').add('Record Payment').end()
      .end()
    } 
  ]
});