foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'UserRegistrationView',
  extends: 'foam.u2.View',

  documentation: 'User Registration View',

  imports: [
    'stack', 'save', 'userDAO', 'user'
  ],

  exports: [
    'as data'
  ],

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
        ^ .registration-container{
          background: white;
          padding: 25px 25px 25px;
        }
        ^ h2{
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
          color: #093649;
        }
        .input-container{
          width: 46%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        ^ .input-container-right {
          width: 46%;
          display: inline-block;
          margin-bottom:20px;
          float: right;
        }
        .input-container-full-width{
          width: 100%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        ^ .check-box{
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
        ^ .net-nanopay-ui-ActionView-signUp{
          position: relative;
          width: 100%;
          height: 40px;
          background: none;
          background-color: #59a5d5;
          font-size: 14px;
          border: none;
          color: white;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        ^ .net-nanopay-ui-ActionView-signUp:hover{
          background: none;
          background-color: #3783b3;
        }
        ^ .property-password {
          -webkit-text-security: disc;
          -moz-text-security: disc;
          text-security: disc;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'firstName',
      validateObj: function(firstName) {
        return 'First name required.'
      }
    },
    {
      name: 'lastName',
      validateObj: function(lastName) {
        if(!lastName) {
          return 'Last name required.'
        }
      }
    },
    {
      name: 'email',
      validateObj: function(email) {
        if(!email){
          return 'Email required.'
        }
      }
    },
    {
      name: 'password',
      validateObj: function(password) {
        if(!password){
          return 'Password required.'
        }
      }
    },
    'organization',
    'department',
    'mobile',
    'agreed'    
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.agreed = false;
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h1').add('Sign Up').end()
          .start().addClass('registration-container')
            .start().addClass('business-registration-input')
              .start().addClass('input-container')
                .start('label').add('First Name').end()
                  .add(this.slot(this.FIRST_NAME.validateObj))                
                  .add(this.FIRST_NAME)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Last Name').end()
                  .add(this.slot(this.LAST_NAME.validateObj))
                  .add(this.LAST_NAME)
              .end()
              .start().addClass('input-container')
                .start('label').add('Company Name').end()
                  .add(this.ORGANIZATION)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Job Title').end()
                  .add(this.DEPARTMENT)
              .end()
              .start().addClass('input-container')
                .start('label').add('Email Address').end()
                  .add(this.slot(this.EMAIL.validateObj))                
                  .add(this.EMAIL)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Phone Number').end()
                  .add(this.slot(this.MOBILE.validateObj))                
                  .add(this.MOBILE)
              .end()
              .start().addClass('input-container-full-width')
                .start('label').add('Password').end()
                  .add(this.slot(this.PASSWORD.validateObj))                
                  .add(this.PASSWORD)
              .end()
            .end()
            .start().addClass('term-conditions')
              .start('div').addClass('check-box').enableClass('agreed', this.agreed$).on('click', function(){ self.agreed = !self.agreed })
                .tag({class:'foam.u2.tag.Image', data: 'ui/images/check-mark.png'}).enableClass('show-checkmark', this.agreed$)
              .end()
              .start('p').add('I agree with the ').end()
              .start('p').addClass('link').add('terms and conditions.').end()
              .start().add(this.SIGN_UP).end()
            .end()
          .end()
          .start('p').add('Already have an account?').end()
          .start('p').addClass('link')
            .add('Sign in.')
            .on('click', function(){ self.stack.push({ class: 'net.nanopay.auth.ui.SignInView' }) })
          .end()
        .end()
      .end()
    },
  ],

  actions: [
    function signUp(X, obj) {
      var self = this;

      var user = self.User.create({
        firstName: self.firstName,
        lastName: self.lastName,
        email: self.email,
        mobile: self.mobile,
        password: self.password,
        organization: self.organization,
        department: self.department
      });

      self.userDAO.put(user).then(function(user) {
        X.stack.push({ class: 'net.nanopay.auth.ui.BusinessRegistrationView', user: user });
      })
    }
  ]
});