
foam.CLASS({
  package: 'net.nanopay.b2b.ui.modals',
  name: 'ApproveModal',
  extends: 'foam.u2.View',

  documentation: 'Approve Invoice Modal',
  
  requires: [
    'net.nanopay.b2b.ui.modals.ModalHeader'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 448px;
        margin: auto;
      }

      ^ .Message-Container{
        width: 448px;
        border-radius: 2px;
        background-color: #ffffff;
      }

      ^ .Approve-Container{
        width: 448px;
        height: 40.8px;
        background-color: #093649;
      }

      ^ .Approve-Text{
        width: 57px;
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: left;
        color: #ffffff;
        margin-left: 19px;
        margin-right: 332px;
        display: inline-block;
      }

      ^ .mainMessage-Text{
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-algin: left;
        color: #093649;
        margin-left: 20px;
        margin-top: 19.5px;
        margin-right: 64px;
        margin-bottom: 10px;
      }

      ^ .close-Button{
        width: 24px;
        height: 24px;
        margin-top: 5px;
        cursor: pointer;
      }

      ^ .input-Box{
        width: 408px;
        height: 60px;
        backgroud-color: #ffffff;
        border: solod 1px rgba(!64, 179, 184, 0.5);
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
        padding-left: 5px;
        padding-right: 5px;
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.2px;
        font-family: Roboto;
        color: #093649;
        text-align: left;
      }

      ^ .Approve-Button{
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: #59aadd;
        cursor: pointer;
        text-align: center;
        color: #ffffff;
        font-family: Roboto;
        font-size: 14px;
        line-height: 2.86;
        letter-spacing: 0.2px;
        margin-top: 5px;
        margin-left: 293px;
        margin-right: 20px;
        margin-bottom: 20px;
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
        .start().addClass('Approve-Button').add('Approve').end()
      .end()
    .end()
    } 
  ]
});
