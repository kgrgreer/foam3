foam.CLASS({
  package: 'net.nanopay.admin.ui.registration',
  name: 'UserRegistrationView',
  extends: 'foam.u2.View',

  documentation: 'User Registration View',

  imports: [
    'stack', 'save'
  ],

  requires: [
    'foam.nanos.auth.User',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 490px;
          margin: auto;
        }
        ^registration-container{
          background: white;
          padding: 30px 25px 20px;
        }
        ^ h2{
          font-family: Roboto;
          font-size: 30px;
          font-weight: 600;
          line-height: 1;
          text-align: left;
          color: #14375d;
          margin-bottom: 20px;
        }
        ^ h3{
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
        } 
        ^ p{
          display: inline-block;
        }
        .link{
          margin-left: 2px;
          color: #59a5d5;
          cursor: pointer;
        }
        ^ input{
          width: 100%;
          height: 40px;
          margin-top: 7px;
        }
        ^ label{
          font-weight: 300;
          font-size: 14px;
          color: #14375d;
        }
        .input-container{
          width: 46%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        .input-container-full-width{
          width: 95.5%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        ^check-box{
          display: inline-block;
          border: solid 1px rgba(164, 179, 184, 0.5);
          width: 14px;
          height: 14px;
          border-radius: 2px;
          margin-right: 10px;
          position: relative;
          top: 5;
        }
        ^ img{
          display: none;
        }
        .agreed{
          background: black;
        }
        .show-checkmark img{
          width: 15px;
          position: relative;
          display: block;
        }
        ^ .foam-u2-ActionView-signUp{
          position: relative;
          width: 100%;
          background: #59a5d5;
          font-size: 14px;
        }
      */}
    })
  ],

  properties: [ 
    'agreed', 
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.agreed = false;
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h2').add('Sign Up').end()
          .start().addClass(this.myClass('registration-container'))
            .start().addClass(this.myClass('business-registration-input'))
              .start().addClass('input-container')
                .start('label').add('First name').end()
                  .add(this.User.FIRST_NAME)
              .end()
              .start().addClass('input-container')
                .start('label').add('Last name').end()
                  .add(this.User.LAST_NAME)
              .end()
              .start().addClass('input-container')
                .start('label').add('Company Name').end()
                  .add(this.User.ORGANIZATION)
              .end()
              .start().addClass('input-container')
                .start('label').add('Job Title').end()
                  .add(this.User.DEPARTMENT)
              .end()
              .start().addClass('input-container')
                .start('label').add('Email Address').end()
                  .add(this.User.EMAIL)
              .end()
              .start().addClass('input-container')
                .start('label').add('Phone Number').end()
                  .add(this.User.MOBILE)
              .end()
              .start().addClass('input-container-full-width')
                .start('label').add('Password').end()
                  .add(this.User.PASSWORD)
              .end()
            .end()
            .start().addClass(this.myClass('term-conditions'))
              .start('div').addClass(this.myClass('check-box')).enableClass('agreed', this.agreed$).on('click', function(){ self.agreed = !self.agreed })
                .tag({class:'foam.u2.tag.Image', data: 'images/check-mark.png'}).enableClass('show-checkmark', this.agreed$)
              .end()
              .start('p').add('I agree with the ').end()
              .start('p').addClass('link').add('terms and conditions.').end()
              .start().add(this.SIGN_UP).end()
            .end()
          .end()
          .start('p').add('Already have an account?').end()
          .start('p').addClass('link')
            .add('Sign in.')
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.admin.ui.signin.SignInView' }) })
          .end()
        .end()     
      .end()
    },
  ],

  actions: [
    function signUp(X, obj) { 
      X.createController.save();
    }
  ]
})