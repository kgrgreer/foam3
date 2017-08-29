foam.CLASS({
  package: 'net.nanopay.retail.ui.forgotPassword',
  name: 'SuccessView',
  extends: 'foam.u2.View',

  imports: [
    'stack'
  ],

  documentation: 'Forgot Password Success View',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 490px;
        margin: auto;
      }

      ^ .Message-Container{
        background-color: #ffffff;
        padding: 25px 25px 25px;
      }

      ^ .Reset-Password{
        width: 225;
        height: 30px;
        font-family: Roboto;
        font-size: 30px;
        font-weight: bold;
        line-height: 1;
        letter-spacing: 0.5px;
        text-align: left;
        color: #093649;
        margin-top: 20px;
        margin-bottom: 30px;
      }

      ^ p{
        display: inline-block;
      }

      ^ .success-Text{
        width: 450px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-bottom: 20px;
      }

      ^ .Back-Button{
        width: 100%;
        height: 40px;
        border-radius: 2px;
        border: solid 1px #59a5d5;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #59aadd;
        margin-top: 10px;
      }
      ^ .Back-Button:hover {
        color: white;
        background: #59aadd;
      }

    */}
    })
  ],

  messages: [
    { name: 'Instructions', message: "Successfully reset password!"}
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
      .addClass(this.myClass())
      .start()
        .start().addClass('Reset-Password').add("Reset Password").end()
        .start().addClass('Message-Container')
          .start().addClass('success-Text').add(this.Instructions).end()
          .start().addClass('Back-Button')
            .add("Back to Sign In")
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.retail.ui.onboarding.SignInView' })})
          .end()
        .end()
      .end()
    }
  ]
})
