foam.CLASS({
  package: 'net.nanopay.b2b.ui.signin',
  name: 'SignInView',
  extends: 'foam.u2.View',

  documentation: 'Sign In View',

  implements: [
    'foam.mlang.Expressions', 
  ],

  exports: [ 'as data' ],

  imports: [
    'stack', 'userDAO', 'user', 'business'
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

      ^ .Message-Container{
        width: 490px;
        height: 251px;
        border-radius: 2px;
        background-color: #ffffff;
      }

      ^ .SignIn-Text{
        width: 97px;
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

      ^ .Password-Text{
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
        margin-bottom: 8px;
      }

      ^ .emailAdd-Text{
        width: 182px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
        margin-left: 20px;
        margin-bottom: 8px;
        padding-top: 13px;
      }
      
      ^ .SignIn-Button{
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

      ^ .link2{
        margin-left: 182px;
        color: #59a5d5;
        cursor: pointer;
      }
      ^ .foam-u2-actionView-save{
        width: 95.5%;
        height: 40px;
        background: #59aadd;
        margin-bottom: 15px;
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
        .start().addClass('SignIn-Text').add("Sign In").end()
        .start().addClass('Message-Container')
          .start().addClass('emailAdd-Text').add("Email Address").end()
          .start(this.EMAIL).addClass('Input-Box').end()
          .start().addClass('Password-Text').add("Password").end()
          .start(this.PASSWORD).addClass('Input-Box').end()
          .start().addClass('SignIn-Button')
            .add("Sign In")
            .on('click', this.signIn)
          .end()
        .end()
        .start('div')
          .start('p').add("Don't have an account?").end()
          .start('p').addClass('link')
            .add("Sign up.")
            .on('click', this.signUp)
          .end()
          .start('p').addClass('link2')
            .add("Forgot Password?")
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.ui.forgotPassword.EmailView' })})
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
  
      if(!this.email || !this.password){
        console.log('Please provide email & password.')
        return;
      }

      this.userDAO.where(this.AND(this.EQ(this.User.EMAIL, this.email), this.EQ(this.User.PASSWORD, this.password))).select().then(function(user){
        if(user.array.length <= 0){
          console.log('Login Failed.')
          return;
        }

        self.user.copyFrom(user.array[0]);
        self.stack.push({ class: 'net.nanopay.b2b.ui.dashboard.DashboardView' })
      })
    }
  ],
});