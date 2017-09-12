foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'SignInView',
  extends: 'foam.u2.View',

  documentation: 'Sign in View',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 490px;
          margin: auto;
          text-align: center;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^sign-in-container{
          background: white;
          padding: 20px;
        }
        ^ input{
          width: 95%;
          height: 40px;
        }
        ^ button{
          width: 95%;
          margin-top: 20px;
          height: 40px;
          background-color: #59aadd;
          cursor: pointer;
        }
        ^ label{
          float: left;
          margin: 10px 0 10px 10px;
        }
        ^ h1{
          margin-top: 30px;
          text-align: left;
        }
        ^ h4{
          font-size: 12px;
          letter-spacing: 0.2px;
          color: #093649;
          float: left;
        }
        ^ h3{
          font-size: 12px;
          letter-spacing: 0.2px;
          color: #093649;
          position: relative;
          top: 5px;
          left: 100;
          color: #59a5d5;
          cursor: pointer;
        }
      */}
    })
  ],

  methods: [
    function initE(){
      this.SUPER();
      
      this
        .addClass(this.myClass())
        .start()
          .start('h1').add('Sign In').end()
          .start().addClass(this.myClass('sign-in-container'))
            .start('label').add('Email Address').end()
            .start('input').end()
            .start('label').add('Password').end()
            .start('input').end()
            .start('button').add('Sign In').end()
          .end()
          .start('h4').add("Don't have an account? ").end()
          .start('h4').add("Sign up.").style({color: '#59a5d5', 'cursor': 'pointer', 'margin-left':'5px'}).end()
          .start('h3').add("Forgot password?")
        .end()
    }
  ]
});