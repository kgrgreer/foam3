foam.CLASS({
  package: 'net.nanopay.retail.ui.forgotPassword',
  name: 'EmailView',
  extends: 'foam.u2.View',

  documentation: 'Forgot Password Email View',

  imports: [
    'stack'
  ],

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
          width: 276px;
          height: 16px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          margin-right: 194px;
          margin-bottom: 20px;
        }

        ^ .Email-Text{
          width: 182px;
          height: 16px;
          font-family: Roboto;
          font-weight: 300;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          margin-bottom: 8px;
          margin-right: 288px;
        }

        ^ .Input-Box{
          width: 100%;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          margin-bottom: 10px;
          padding: 0 15px;
          outline: none;
          font-family: Roboto;
          font-size: 12px;
          text-align: left;
          color: #093649;
          font-weight: 300;
          letter-spacing: 0.2px;
        }
        ^ .Input-Box:focus {
          border: solid 1px #59A5D5;
        }
        ^ .Next-Button{
          width: 100%;
          height: 40px;
          border-radius: 2px;
          background-color: #59aadd;
          margin-top: 10px;
          text-align: center;
          color: #ffffff;
          font-family: Roboto;
          font-size: 14px;
          line-height: 2.86;
          cursor: pointer;
        }
        ^ .Next-Button:hover {
          cursor: pointer;
          background: none;
          background-color: #3783b3;
        }

      */}
    })
  ],

  messages: [
    { name: 'Instructions', message: 'Please input your registered email address.'}
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
        .start().addClass('Email-Text').add("Email Address").end()
        .start('input').addClass('Input-Box').end()
        .start().addClass('Next-Button')
          .add('Next')
          .on('click', function(){ self.stack.push({ class: 'net.nanopay.retail.ui.forgotPassword.ResendView' })})
        .end()
      .end()
      .start('div')
        .start('p').add('Remember your password?').end()
        .start('p').addClass('link')
          .add('Sign in.')
          .on('click', function(){ self.stack.push({ class: 'net.nanopay.retail.ui.onboarding.SignInView' })})
        .end()
      .end()
    }
  ]
})
