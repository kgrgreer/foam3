foam.CLASS({
  package: 'net.nanopay.retail.ui.forgotPassword',
  name: 'ResetView',
  extends: 'foam.u2.View',

  imports: [
    'stack'
  ],

  documentation: 'Forgot Password Reset View',

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
        width: 225px;
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
      ^ .newPassword-Text{
        width: 182px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
      ^ .confirmPassword-Text{
        width: 182px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
      ^ .Confirm-Button{
        width: 100%;
        height: 40px;
        border-radius: 2px;
        border: solid 1px #59a5d5;
        background-color: #59aadd;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #ffffff;
      }
      ^ .Confirm-Button:hover {
        cursor: pointer;
        background-color: #3783b3;
        border-color: #3783b3;
      }
      ^ .Input-Box{
        width: 100%;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-bottom: 20px;
        margin-top: 7px;
        padding: 0 15px;
        font-family: Roboto;
        font-size: 12px;
        text-align: left;
        color: #093649;
        font-weight: 300;
        letter-spacing: 0.2px;
        outline: none;
      }
      ^ .property-password {
        -webkit-text-security: disc;
        -moz-text-security: disc;
        text-security: disc;
      }
      ^ .Input-Box:focus {
        border: solid 1px #59A5D5;
      }
      ^ .link{
        margin-left: 2px;
        color: #59a5d5;
        cursor: pointer;
      }
    */}
  })
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
          .start().addClass('newPassword-Text').add("New Password").end()
          .start('input').addClass('Input-Box').end()
          .start().addClass('confirmPassword-Text').add("Confirm Password").end()
          .start('input').addClass('Input-Box property-password').end()
          .start().addClass('Confirm-Button')
            .add("Confirm")
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.retail.ui.forgotPassword.SuccessView'})})
          .end()
        .end()
        .start('p').add("Remember your password?").end()
        .start('p').addClass('link')
          .add('Sign in.')
          .on('click', function(){ self.stack.push({ class: 'net.nanopay.retail.ui.onboarding.SignInView' })}) 
        .end()
      .end()
    }
  ]
})
