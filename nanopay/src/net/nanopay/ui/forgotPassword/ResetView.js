foam.CLASS({
  package: 'net.nanopay.ui.forgotPassword',
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
        width: 490px;
        height: 251px;
        border-radius: 2px;
        background-color: #ffffff;
        padding-top: 5px;
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

      ^ .newPassword-Text{
        width: 182px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-top: 15px;
        margin-left: 20px;
        margin-right: 288px;
        margin-bottom: 5px;
      }

      ^ .confirmPassword-Text{
        width: 182px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-algin: left;
        color: #093649;
        margin-left: 20px;
        margin-bottom: 5px;
        margin-top: 10px;
      }
      
      ^ .Confirm-Button{
        width: 450px;
        height: 40px;
        border-radius: 2px;
        border: solid 1px #59a5d5;
        margin-left: 20px;
        margin-right: 20px;
        background-color: #59aadd;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #ffffff;
        margin-top: 10px;
      }

      ^ .Input-Box{
        width: 450px;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 10px;
        margin-top: 5px;
        padding-left: 5px;
        padding-right: 5px;
        font-family: Roboto;
        font-size: 12px;
        text-align: left;
        color: #093649;
        font-weight: 300;
        letter-spacing: 0.2px;
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
          .start('input').addClass('Input-Box').end()
          .start().addClass('Confirm-Button')
            .add("Confirm")
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.ui.forgotPassword.SuccessView'})})
          .end()
        .end()
        .start('p').add("Remember your password?").end()
        .start('p').addClass('link')
          .add('Sign in.')
          .on('click', function(){ self.stack.push({ class: 'net.nanopay.auth.ui.SignInView' })})
        .end()
      .end()
    }
  ]
});
