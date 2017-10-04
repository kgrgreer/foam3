
foam.CLASS({
  package: 'net.nanopay.b2b.ui.modals',
  name: 'ResendInviteModal',
  extends: 'foam.u2.View',

  documentation: 'Resend Partner Invite Modal',

  requires: [
    'net.nanopay.b2b.ui.modals.ModalHeader'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        height: 200px;
        width: 448px;
        margin: auto;
        padding-bottom: 20px;
      }
      ^ .confirm-button{
        top: 20px;
        right: 30px;
      }
      ^ h4{
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        color: #093649;
        margin-top: 40px;
        margin-bottom: 0px;
        text-align: center;
      }
      ^ .cancel-button{
        position: relative;
        top: 61px;
        left: 40px;
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
        title: 'Resend Invite'
      }))
      .addClass(this.myClass())
      .start()
        .start('h4').add('Do you want to resend invite to xxx@xx.com?').end()
        .start().addClass('Cancel-button').add('Cancel').end()
        .start().addClass('confirm-button').add('Confirm').end()
      .end()
    } 
  ]
});