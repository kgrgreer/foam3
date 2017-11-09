foam.CLASS({
  package: 'net.nanopay.ui.forgotPassword',
  name: 'ResendView',
  extends: 'foam.u2.View',

  documentation: 'Forgot Password Resend View',

  imports: [
    'stack',
    'resetPasswordToken'
  ],

  exports: [ 'as data' ],

  requires: [
    'foam.nanos.auth.User'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 490px;
          margin: auto;
        }
        ^ .Message-Container{
          width: 490px;
          height: 145px;
          border-radius: 2px;
          background-color: #ffffff;
          padding-top: 5px;
        }
        ^ .Forgot-Password{
          width: 236px;
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
        ^ .link{
          margin-left: 2px;
          color: #59a5d5;
          cursor: pointer;
        }
        ^ .Instructions-Text{
          width: 450px;
          height: 40px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          margin-top: 15px;
          margin-left: 20px;
          margin-right: 20px;
          margin-bottom: 20px;
        }
        ^ .Resend-Button{
          width: 450px;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #59a5d5;
          margin-left: 20px;
          margin-right: 20px;
          background: #ffffff;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
          color: #59a5d5;
        }

        ^ .Change-Button{
          width: 450px;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #59a5d5;
          margin-top: 150px;
          background: #59aadd;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
          color: white;
        }

      */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'email'
    }
  ],

  messages: [
    { name: 'Instructions', message: "We've sent the instructions to your email. Please check your inbox to continue."}
  ],

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
      .addClass(this.myClass())
      .start()
        .start().addClass('Forgot-Password').add('Forgot Password').end()
        .start().addClass('Message-Container')
          .start().addClass('Instructions-Text').add(this.Instructions).end()
          .start(this.RESEND_EMAIL).addClass('Resend-Button').end()
        .end()
        .start('p').add('Remember your password?').end()
        .start('p').addClass('link')
          .add('Sign in.')
          .on('click', function() {self.stack.push({ class: 'net.nanopay.auth.ui.SignInView' })})
        .end()
        .start('div')
          .add('Change Your Password!').addClass('Change-Button')
          .on('click', function() {self.stack.push({ class: 'net.nanopay.ui.forgotPassword.ResetView'})})
        .end()
      .end()
      }
  ],

  actions: [
    {
      name: 'resendEmail',
      label: 'Resend Email',
      code: function (X) {
        var self = this;
        var user = this.User.create({ email: this.email });
        this.resetPasswordToken.generateToken(user).then(function (result) {
          if ( ! result ) {
            throw new Error('Error generating reset token');
          }
          // TODO: show success message
        })
        .catch(function (err) {
          throw err;
        });
      }
    }
  ]
});
