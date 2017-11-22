foam.CLASS({
  package: 'net.nanopay.retail.ui.onboarding',
  name: 'SignInView',
  extends: 'foam.u2.View',

  documentation: 'Sign In View',

  implements: [
    'foam.mlang.Expressions',
  ],

  exports: [ 'as data' ],

  imports: [
    'stack', 'userDAO', 'user'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.comics.DAOCreateControllerView'
  ],

  properties: [
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'Password',
      name: 'password',
      view: 'foam.u2.view.PasswordView'
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        width: 490px;
        margin: auto;
      }
      ^ input{
          width: 100%;
          height: 40px;
          margin-top: 7px;
        }
      ^ .Message-Container{
        background-color: #ffffff;
        padding: 25px 25px 25px;
      }
      ^ .SignIn-Text{
        height: 30px;
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
      ^ .Password-Text{
        width: 182px;
        height: 16px;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-right: 288px;
        margin-top: 20px;
      }
      ^ .emailAdd-Text{
        width: 182px;
        height: 16px;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
      ^ .SignIn-Button{
        width: 100%;
        height: 40px;
        border-radius: 2px;
        border: solid 1px #59a5d5;
        margin-right: 20px;
        background-color: #59aadd;
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        color: #ffffff;
        margin-top: 10px;
      }
      ^ .SignIn-Button:hover {
        cursor: pointer;
        background-color: #3783b3;
        border-color: #3783b3;
      }
      ^ .Input-Box{
        width: 100%;
        height: 40px;
        margin-top: 7px;
        font-family: Roboto;
        font-size: 12px;
        text-align: left;
        color: #093649;
        font-weight: 300;
        letter-spacing: 0.2px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
      }
      ^ .Input-Box:focus {
        border: solid 1px #59A5D5;
      }
      ^ .link{
        margin-left: 2px;
        color: #59a5d5;
        cursor: pointer;
      }
      ^ .link2{
        float: right;
        color: #59a5d5;
        cursor: pointer;
      }
      ^ .foam-u2-actionView-save{
        width: 95.5%;
        height: 40px;
        background: #59aadd;
        margin-bottom: 15px;
      }
      ^ .foam-u2-view-PasswordView {
        width: 100%;
        height: 40px;
        margin-bottom: 10px;
        margin-top: 7px;
        font-family: Roboto;
        font-size: 14px;
        text-align: left;
        color: #093649;
        font-weight: 300;
        letter-spacing: 0.2px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        outline: none;
        padding: 0 15px;
      }
      .foam-u2-view-PasswordView:focus {
        border: solid 1px #59A5D5;
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
        .start().addClass('SignIn-Text').add('Sign In').end()
        .start().addClass('Message-Container')
          .start().addClass('emailAdd-Text').add('Email Address').end()
          .start(this.EMAIL).addClass('Input-Box').end()
          .start().addClass('Password-Text').add('Password').end()
          .start(this.PASSWORD).addClass('Input-Box').end()
          .start().addClass('SignIn-Button')
            .add('Sign In')
            .on('click', this.signIn)
          .end()
        .end()
        .start('div')
          .start('p').add('Don\'t have an account?').end()
          .start('p').addClass('link')
            .add('Sign up.')
            .on('click', this.signUp)
          .end()
          .start('p').addClass('link2')
            .add('Forgot Password?')
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.retail.ui.forgotPassword.EmailView' })})
          .end()
        .end()
      .end()
    }
  ],

  listeners: [
    function signUp(){
      var self = this;
      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: net.nanopay.auth.ui.UserRegistrationView,
          back: this.stack.back.bind(this.stack),
          dao: this.userDAO,
          factory: function() {
            return self.User.create();
          },
          showActions: false
        }));
      this.stack.push(view);
    },

    function signIn(){
      var self = this;

      if ( ! this.email || ! this.password ) {
        console.log('Please provide email & password.');
        return;
      }

      this.userDAO.where(this.AND(this.EQ(this.User.EMAIL, this.email), this.EQ(this.User.PASSWORD, this.password))).select().then(function(user){
        if ( user.array.length <= 0 ) {
          console.log('Login Failed.');
          return;
        }

        self.user.copyFrom(user.array[0]);
        self.stack.push({ class: 'net.nanopay.retail.ui.dashboard.DashboardView' });
      })
    }
  ],
});
