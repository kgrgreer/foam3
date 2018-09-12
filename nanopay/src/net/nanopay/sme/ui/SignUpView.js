foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'SignUpView',
    extends: 'foam.u2.View',
  
    documentation: 'User Sign up View for Ablii. For first time users.',
  
    imports: [
      'stack',
      'user',
      'userDAO',
      'validateEmail',
      'validatePassword'
    ],
  
    exports: [
      'as data'
    ],
  
    requires: [
      'foam.nanos.auth.Phone',
      'foam.nanos.auth.User',
      'foam.u2.dialog.NotificationMessage',
      'net.nanopay.sme.ui.SplitBorder',
      'foam.u2.Element'
    ],
  
    css: `
      ^ {
        background: white;
        width: 100%;
      }
         
    `,
  
    properties: [
      {
        class: 'String',
        name: 'firstNameField',
        value: ''
      },
      {
        class: 'String',
        name: 'lastNameField',
        value: ''
      },
      {
        class: 'String',
        name: 'companyNameField',
        value: ''
      },
      {
        class: 'String',
        name: 'businessPhoneField',
        value: ''
      },
      {
        class: 'String',
        name: 'emailField',
        value: ''
      },
      {
        class: 'String',
        name: 'passwordField',
        value: ''
      }
    ],
  
    messages: [
        { name: 'Title', message: 'Create an account' },
        { name: 'SubTitle', message: 'Already have one?' },
        { name: 'Fname', message: 'First Name' },
        { name: 'Lname', message: 'Last Name' },
        { name: 'Cname', message: 'Company Name' },
        { name: 'Bphone', message: 'Business Phone' },
        { name: 'Email', message: 'Email Address' },
        { name: 'Passwrd', message: 'Password' },
        { name: 'ImageText', message: 'Text For Image :)' }
    ],
  
    methods: [
      function initE() {
        this.SUPER();
  
        var split = net.nanopay.sme.ui.SplitBorder.create();
  
        var left = this.Element.create()
        .start('img').addClass('sme-image').attr('src', 'images/placeholder-background.jpg').end()
        .start().addClass('sme-text-block')
          .start('h3').add(this.ImageText).end()
        .end();
  
        var right = this.Element.create()
        .start().addClass('sme-createView')
          .start().addClass('sme-registration-container')
  
            .start().add(this.Title).addClass('sme-title').end()
  
            .start().addClass('sme-subTitle')
              .start('span').add(this.SubTitle).end()
              .start('span').addClass('sme-link')
                  .add('Sign in.')
                  .on('click', function() { self.stack.push({ class: 'net.nanopay.sme.ui.SignInView' }) })
              .end()
            .end()
  
            .start().addClass('sme-nameInputContainer')
              .start().addClass('sme-nameRowL')
                .start('p').add(this.Fname).addClass('sme-labels').end()
                .start(this.FIRST_NAME_FIELD).addClass('sme-nameFields').end()
              .end()
              .start().addClass('sme-nameRowR')
                .start('p').add(this.Lname).addClass('sme-labels').end()
                .start(this.LAST_NAME_FIELD).addClass('sme-nameFields').end()
              .end()
            .end()
  
            .start('p').addClass('sme-inputContainer')
              .start().add(this.Cname).addClass('sme-labels').end()
              .start(this.COMPANY_NAME_FIELD).addClass('sme-dataFields').end()
            .end()
  
            .start('p').addClass('sme-inputContainer')
              .start().add(this.Bphone).addClass('sme-labels').end()
              .start(this.BUSINESS_PHONE_FIELD).addClass('sme-dataFields').end()
            .end()
  
            .start().addClass('sme-inputContainer')
              .start().add(this.Email).addClass('sme-labels').end()
              .start(this.EMAIL_FIELD).addClass('sme-dataFields').end()
            .end()
  
            .start().addClass('sme-passwrdInputContainer')
                .start().add(this.Passwrd).addClass('sme-labels').end()
                .start(this.PASSWORD_FIELD).addClass('sme-property-password').end()
            .end()
  
            .start().add(this.CREATE_NEW).end()
  
            .end()
          .end();
  
        split.leftPanel.add(left);
        split.rightPanel.add(right);
        
        this.add(split);
      },
  
      function makePhone(phoneNumber) {
        return this.Phone.create({ number: phoneNumber });
      },
  
      function validating() {
        if ( this.isEmpty(this.firstNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'First Name Field Required.', type: 'error' }));
          return false;
        }
        if ( this.firstNameField.length > 70 ) {
          this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
          return false;
        }
        if ( /\d/.test(this.firstNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'First name cannot contain numbers', type: 'error' }));
          return false;
        }
        if ( this.lastNameField.length > 70 ) {
          this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
          return false;
        }
        if ( /\d/.test(this.lastNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'Last name cannot contain numbers.', type: 'error' }));
          return false;
        }
        if ( this.isEmpty(this.lastNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'Last Name Field Required.', type: 'error' }));
          return false;
        }
        if ( this.companyNameField > 70 ) {
          this.add(this.NotificationMessage.create({ message: 'Company Name cannot exceed 70 characters.', type: 'error' }));
          return false;
        }
        if ( this.isEmpty(this.companyNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'Company Name Field Required.', type: 'error' }));
          return false;
        }
        if ( this.isEmpty(this.businessPhoneField) ) {
          this.add(this.NotificationMessage.create({ message: 'Business Phone Field Required.', type: 'error' }));
          return false;
        }
        if ( this.isEmpty(this.emailField) ) {
          this.add(this.NotificationMessage.create({ message: 'Email Field Required.', type: 'error' }));
          return false;
        }
        if ( ! this.validateEmail(this.emailField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
          return false;
        }
        if ( ! (/^\d{3}?[\-]?\d{3}[\-]?\d{4}$/).test(this.businessPhoneField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
          return false;
        }
        if ( this.isEmpty(this.passwordField) ) {
          this.add(this.NotificationMessage.create({ message: 'Password Field Required.', type: 'error' }));
          return false;
        }
        if ( ! this.validatePassword(this.passwordField) ) {
          this.add(this.NotificationMessage.create({ message: 'Password must contain one lowercase letter, one uppercase letter, one digit, and be between 7 and 32 characters in length.', type: 'error' }));
          return false;
        }
        return true;
      },
  
      function isEmpty(field) {
        field = field.trim();
        if ( field === '' ) return true;
        return false;
      }
    ],
  
    actions: [
      {
        name: 'createNew',
        label: 'Create account',
        code: function(X, obj) {
          if ( ! this.validating() ) return;
          var self = this;
          var user = self.User.create({
            firstName: self.firstNameField,
            lastName: self.lastNameField,
            email: self.emailField,
            phone: self.makePhone(self.phoneField),
            desiredPassword: self.passwordField,
            organization: self.companyNameField
          });
          
          // TODO: Logic for Saving/Adding User 
          X.stack.push({ class: 'net.nanopay.sme.ui.SignInView' });
      }
    }
    ]
  });
  
  