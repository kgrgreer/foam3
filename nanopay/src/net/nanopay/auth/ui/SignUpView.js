foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'SignUpView',
  extends: 'foam.nanos.auth.SignUpView',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'businessRegistrationDAO',
    'ctrl'
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h1').add('Sign Up').end()
          .start().addClass('registration-container')
            .start().addClass('business-registration-input')
              .start().addClass('input-container')
                .start('label').add('First Name').end()
                  .add(this.FIRST_NAME)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Last Name').end()
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
                  .add(this.EMAIL)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Phone Number').end()
                  .add(this.PHONE)
              .end()
              .start().addClass('input-container-full-width')
                .start('label').add('Password').end()
                  .add(this.PASSWORD)
              .end()
            .end()
            .start().addClass('term-conditions')
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
    {
      name: 'signUp',
      isEnabled: function(firstName, lastName, email, password) {
        return firstName && lastName && email && password;
      },
      code: function(X, obj) {
        var self = this;
        var user = self.User.create({
          firstName: self.firstName,
          lastName: self.lastName,
          email: self.email,
          businessPhone: self.phone,
          desiredPassword: self.password,
          organization: self.organization,
          businessName: self.organization,
          jobTitle: self.department,
          group: 'business',
          type: 'Business',
          invited: true
        });

        this.businessRegistrationDAO.put(user).then(function(user) {
          self.user = user;

          X.ctrl.add(self.NotificationMessage.create({ message: 'User Created.' }));
          X.stack.push({ class: 'net.nanopay.auth.ui.SignInView', userCreated: true });
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
