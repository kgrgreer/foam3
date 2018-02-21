
foam.CLASS({
  package: 'net.nanopay.b2b.ui.modals',
  name: 'NewInviteModal',
  extends: 'foam.u2.View',
  
  requires: [
    'net.nanopay.b2b.ui.modals.ModalHeader'
  ],

  imports: [
    'contact'
  ],

  documentation: 'New Invite Pop Up',

  properties: [
    'companyName',
    'contactName',
    'email',
    'message'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        height: 400px;
        width: 448px;
        margin: auto;
      }

      ^ .confirm-button{
        position: relative;
        top: 20px;
        right: 30px;
      }
      ^ .s2-input-container{
        width: 42%;
        display: inline-block;
        margin-left: 20px;
        margin-top: 30px;
      }
      ^ label{
        width: 78px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
      ^ > .s2-input-container > input{
        width: 100%;
        height: 35px;
        margin-top: 8px;
      }
      ^ .s1-input-container{
        width: 100%;
        margin-top: 20px;
      }
      ^ > .s1-input-container > input{
        width: 89%;
        margin-left: 20px;
        height: 35px;
        margin-top: 8px;
      }
      ^ > .s1-input-container > label{
        margin-left: 20px;
      }
      ^ > .s1-input-container > .message{
        height: 65px;
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
        title: 'New Invite'
      }))
      .addClass(this.myClass())
        .start().addClass('s2-input-container')
          .start('label').add('Business Name').end()
          .start(this.COMPANY_NAME).end()
        .end()
        .start().addClass('s2-input-container')
          .start('label').add('Contact Name').end()
          .start(this.CONTACT_NAME).end()
        .end()
        .start().addClass('s1-input-container')
          .start('label').add('Email Address').end()
          .start(this.EMAIL).end()
        .end()
        .start().addClass('s1-input-container')
          .start('label').add('Message').end()
          .start(this.MESSAGE).addClass('message').end()
        .end()
        .start().addClass('confirm-button').add('Send').end()
      .end()
    } 
  ]
});