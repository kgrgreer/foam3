
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'ApproveModal',
  extends: 'foam.u2.View',

  documentation: 'Approve Invoice Modal',
  
  requires: [
    'net.nanopay.common.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.invoice.ui.modal.ModalStyling'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ .input-box{
        margin: 0px 20px 20px 20px;
      }
      ^ .mainMessage-Text{
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-algin: left;
        color: #093649;
        margin: 20px 65px 10px 20px;
      }

      ^ .blue-button{
        margin: 5px 20px 20px 293px;
      }
    */}
    })
  ],
  
  messages: [
    { name: 'Instructions', message: 'Approving the selected invoices'}
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;
    
    this
    .tag(this.ModalHeader.create({
      title: 'Approve'
    }))
    .addClass(this.myClass())
      .start()
        .start().addClass('mainMessage-Text').add(this.Instructions).end()
        .start('input').addClass('input-Box').end()
        .start().addClass('blue-button').add('Approve').end()
      .end()
    .end()
    } 
  ]
})
