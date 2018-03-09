foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AddBusinessView',
  extends: 'foam.u2.Controller',

  documentation: 'View for adding a business',

  requires: [
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
  ],

  imports: [
    'showNotification',
    'stack',
    'userDAO',
    'validateEmail',
    'validatePhone',
    'validateTitleNumOrAuth'
  ],

  css: `
    ^ .container {
      width: 540px;
      margin: 0 auto;
    }
    ^ .header {
      font-size: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
    }
    ^ .description {
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
    }
    ^ .label {
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: 0;
    }
    ^ .nameInput {
      width: 166px;
      height: 40px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .nameMargins {
      margin-left: 20.5px;
      margin-right: 20.5px;
    }
    ^ .largeInput {
      width: 540px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .marginLeft {
      margin-left: 20px;
    }
    ^ .countryCodeInput {
      width: 105px;
      height: 40px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .phoneNumberInput {
      width: 415px;
      height: 40px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px;
      font-size: 12px;
      color: #093649;
      outline: none;
    }
    ^ .buttonDiv {
      width: 100%;
      height: 60px;
      background-color: #edf0f5;
      position: fixed;
      bottom: 0;
      z-index: 200;
    }
    ^ .net-nanopay-ui-ActionView-closeButton {
      margin-left: 60px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-top: 10px;
    }
    ^ .net-nanopay-ui-ActionView-closeButton:hover {
      background: lightgray;
    }
    ^ .net-nanopay-ui-ActionView-addButton {
      float: right;
      margin-right: 60px;
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      margin-top: 10px;
    }
    ^ .net-nanopay-ui-ActionView-addButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
  `,

  properties: [
    {
      name: 'firstName',
      class: 'String'
    },
    {
      name: 'middleInitials',
      class: 'String'
    },
    {
      name: 'lastName',
      class: 'String'
    },
    {
      name: 'jobTitle',
      class: 'String'
    },
    {
      name: 'emailAddress',
      class: 'String'
    },
    {
      name: 'confirmEmailAddress',
      class: 'String'
    },
    {
      name: 'countryCode',
      class: 'String'
    },
    {
      name: 'phoneNumber',
      class: 'String'
    },
    {
      name: 'nameFocused',
      class: 'Boolean',
      value: false
    },
    {
      name: 'phoneFocused',
      class: 'Boolean',
      value: false
    }
  ],

  messages: [
    { name: 'Title', message: 'Add Business' },
    { name: 'Description', message: 'Fill in the details for the admin user of this business, the user will receive an email with login credentials after.' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleInitialsLabel', message: 'Middle Initials (optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailLabel', message: 'Email Address' },
    { name: 'ConfirmEmailLabel', message: 'Confirm Email Address' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start('p').add(this.Title).addClass('header').end()
            .start('p').add(this.Description).addClass('description').end()
            .start()
              .start().addClass('inline')
                .start('p').add(this.FirstNameLabel).addClass('label').end()
                .start(this.FIRST_NAME).addClass('nameInput').end()
              .end()
              .start().addClass('inline nameMargins')
                .start('p').add(this.MiddleInitialsLabel).addClass('label').end()
                .start(this.MIDDLE_INITIALS).addClass('nameInput').end()
              .end()
              .start().addClass('inline')
                .start('p').add(this.LastNameLabel).addClass('label').end()
                .start(this.LAST_NAME).addClass('nameInput').end()
              .end()
            .end()
            .start()
              .start('p').add(this.JobTitleLabel).addClass('label').end()
              .start(this.JOB_TITLE).addClass('largeInput').end()
            .end()
            .start()
              .start('p').add(this.EmailLabel).addClass('label').end()
              .start(this.EMAIL_ADDRESS).addClass('largeInput').end()
            .end()
            .start()
              .start('p').add(this.ConfirmEmailLabel).addClass('label').end()
              .start(this.CONFIRM_EMAIL_ADDRESS).addClass('largeInput').end()
            .end()
            .start()
              .start().addClass('inline')
                .start('p').add(this.CountryCodeLabel).addClass('label').end()
                .start(this.COUNTRY_CODE).addClass('countryCodeInput').end()
              .end()
              .start().addClass('inline marginLeft')
                .start('p').add(this.PhoneNumberLabel).addClass('label').end()
                .start(this.PHONE_NUMBER).addClass('phoneNumberInput').end()
              .end()
            .end()
          .end()
          .start().addClass('buttonDiv')
            .start(this.CLOSE_BUTTON).end()
            .start(this.ADD_BUTTON).end()
          .end()
        .end();
    },

    function validations() {
      if ( this.firstName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( this.middleInitials.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Middle initials cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( this.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( ! this.validateTitleNumOrAuth(this.jobTitle) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid job title.', type: 'error' }));
        return false;
      }
      if ( ! this.validateEmail(this.emailAddress) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
        return false;
      }
      if ( this.emailAddress != this.confirmEmailAddress ) {
        this.add(this.NotificationMessage.create({ message: 'Confirmation email does not match.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePhone(this.phoneNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
        return false;
      }

      return true;
    },

    function addBusiness() {
      var self = this;

      if ( ( this.firstName == null || this.firstName.trim() == '' ) ||
      ( this.middleInitials == null || this.middleInitials.trim() == '' ) || 
      ( this.lastName == null || this.lastName.trim() == '' ) || 
      ( this.jobTitle == null || this.jobTitle.trim() == '' ) ||
      ( this.emailAddress == null || this.emailAddress.trim() == '' ) ||
      ( this.confirmEmailAddress == null || this.confirmEmailAddress.trim() == '' ) ||
      ( this.countryCode == null || this.countryCode.trim() == '' ) ||
      ( this.phoneNumber == null || this.phoneNumber.trim() == '' ) ) {
        this.add(this.NotificationMessage.create({ message: 'Please fill out all fields before proceeding.', type: 'error' }));
        return;
      }

      if ( ! this.validations() ) {
        return;
      }

      var businessPhone = this.Phone.create({
        number: this.countryCode + ' ' + this.phoneNumber
      });

      var newBusiness = this.User.create({
        firstName: this.firstName,
        middleName: this.middleInitials,
        lastName: this.lastName,
        email: this.emailAddress,
        department: this.jobTitle,
        type: 'Business',
        phone: businessPhone
      });

      if ( newBusiness.errors_ ) {
        this.add(this.NotificationMessage.create({ message: newBusiness.errors_[0][1], type: 'error' }));
        return;
      }
      if ( businessPhone.errors_ ) {
        this.add(this.NotificationMessage.create({ message: businessPhone.errors_[0][1], type: 'error' }));
        return;
      }

      this.userDAO.put(newBusiness).then(function(response) {
        self.showNotification('New business successfully added!', '');
        self.stack.back();
      }).catch(function (error) {
        self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
      });
    }
  ],

  actions: [
    {
      name: 'closeButton',
      label: 'Close',
      code: function (X) {
        this.stack.back();
      }
    },
    {
      name: 'addButton',
      label: 'Add',
      code: function (X) {
        this.addBusiness();
      }
    }
  ]
});