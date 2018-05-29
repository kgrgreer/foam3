
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'ApproveModal',
  extends: 'foam.u2.Controller',

  documentation: 'Approve Invoice Modal',
  
  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  properties: [
    {
      class: 'String',
      name: 'note',
      view: 'foam.u2.tag.TextArea'
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^ {
        width: 448px;
        margin: auto;
        font-family: Roboto;
      }
      ^ .input-box{
        margin: 0px 20px 20px 20px;
      }
      ^ .mainMessage-Text{
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        text-align: left;
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
        .start(this.NOTE).addClass('input-Box').end()
        .start().addClass('blue-button').addClass('btn').add('Approve').end()
      .end()
    .end()
    } 
  ]
})
