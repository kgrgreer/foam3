// TODO: Company Name field is being stored in User.jobTitle <- will new field be added??
// TODO: ContactPhone Num. field is being stored in User.contactPhone <- will new field be added??


foam.CLASS({
    package: 'net.nanopay.contacts.ui.modal',
    name: 'AddContactView',
    extends: 'foam.u2.Controller',

    documentation: 'View for adding a Contact',

    requires: [
      'foam.nanos.auth.Phone',
      'foam.nanos.auth.User',
      'foam.u2.CheckBox',
      'foam.u2.dialog.NotificationMessage',
      'net.nanopay.admin.model.AccountStatus',
      'net.nanopay.admin.model.ComplianceStatus'
    ],

    imports: [
      'inviteToken',
      'stack',
      'user',
      'userDAO',
      'validateEmail',
      'validatePhone',
      'validateTitleNumOrAuth',
      'inClass'
    ],

    export: [
      'isEdit'
    ],

    css: `
      ^ .container {
         width: 570px;
      }
      ^ .innerContainer {
        width: 540px;
        margin-top: 10px;
        margin-bottom: 10px;
        margin-left: 10px;
        margin-right: 10px;

      }
      ^ .nameContainer {
        position: relative;
        height: 64px;
        width: 100%;
        //overflow: hidden;
        box-sizing: border-box;
        margin-bottom: 30px;
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
        text-align: center;
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
      ^ .nameDisplayContainer {
        position: absolute;
        top: 0;
        left: 0;
        height: 64px;
        width: 100%;
        opacity: 1;
        box-sizing: border-box;
        transition: all 0.15s linear;
        z-index: 10;
      }
      ^ .nameDisplayContainer.hidden {
        left: 540px;
        opacity: 0;
      }
      ^ .nameDisplayContainer p {
        //margin: 0;
        margin-bottom: 8px;
      }
      ^ .legalNameDisplayField {
        width: 100%;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5) !important;
        padding: 12px 13px;
        box-sizing: border-box;
      }
      ^ .nameInputContainer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 64px;
        opacity: 1;
        box-sizing: border-box;
        z-index: 9;
        margin-top: 15px;
      }
      ^ .nameInputContainer.hidden {
        pointer-events: none;
        opacity: 0;
      }
      ^ .phoneFieldsCol {
        display: inline-block;
        vertical-align: middle;
        height: 64px;
        opacity: 1;
        box-sizing: border-box;
        margin-right: 20px;
        transition: all 0.15s linear;
      }
      ^ .nameFieldsCol {
        display: inline-block;
        vertical-align: middle;
        /* 100% minus 2x 20px padding equally divided by 3 fields */
        width: calc((100% - 40px) / 3);
        height: 64px;
        opacity: 1;
        box-sizing: border-box;
        margin-right: 20px;
        transition: all 0.15s linear;
      }
      ^ .nameFieldsCol:last-child {
        margin-right: 0;
      }
      ^ .nameFieldsCol p {
        margin: 0;
        margin-bottom: 8px;
      }
      ^ .nameFieldsCol.firstName {
        opacity: 0;
      }
      ^ .nameFieldsCol.middleName {
        opacity: 0;
        transform: translateX(-166.66px);
      }
      ^ .nameFieldsCol.lastName {
        opacity: 0;
        transform: translateX(-166.66px);
      }
      ^ .nameFields {
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        padding: 12px 13px;
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        outline: none;
      }
      ^ .largeInput {
        height: 40px;
        width: 100%;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        padding: 12px;
        font-size: 12px;
        color: #093649;
        outline: none;
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
      ^ .net-nanopay-ui-ActionView-closeButton {
        width: 24px;
        height: 24px;
        margin: 0;
        margin-top: 7px;
        margin-right: 50px;
        cursor: pointer;
        display: inline-block;
        float: right;
        outline: 0;
        border: none;
        background: transparent;
        box-shadow: none;
      }
      ^ .net-nanopay-ui-ActionView-closeButton:hover {
        background: transparent;
        background-color: transparent;
      }
      ^ .net-nanopay-ui-ActionView-addButton {
        //float: right;
        border-radius: 2px;
        background-color: %SECONDARYCOLOR%;
        color: white;
        width: 100%;
        vertical-align: middle;
        //margin-right: 60px;
        margin-top: 10px;
        margin-bottom: 20px;
      }
      ^ .net-nanopay-ui-ActionView-addButton:hover {
        background: %SECONDARYCOLOR%;
        opacity: 0.9;
      }
      // ^ .property-confirmEmailAddress {
      //   margin-bottom: 10px;
      // }
      ^ .navigationBar {
        position: fixed;
        width: 100%;
        height: 60px;
        left: 0;
        bottom: 0;
        background-color: white;
        z-index: 100;
      }
      ^ .foam-u2-TextField:focus {
        border: solid 1px #59A5D5;
      }
      ^ .popUpTitle {
        width: 198px;
        height: 40px;
        font-family: Roboto;
        font-size: 14px;
        line-height: 40.5px;
        letter-spacing: 0.2px;
        text-align: left;
        color: #ffffff;
        margin-left: 20px;
        display: inline-block;
      }
      ^ .popUpHeader {
        width: 100%;
        height: 6%;
        background-color: %PRIMARYCOLOR%;
      }
    `,

    properties: [
      'data',
      {
        class: 'Boolean',
        name: 'isEditingName',
        value: false,
        postSet: function(oldValue, newValue) {
          this.displayedLegalName = '';
          if ( this.firstNameField  ) this.displayedLegalName += this.firstNameField;
          if ( this.middleNameField ) this.displayedLegalName += ' ' + this.middleNameField;
          if ( this.lastNameField   ) this.displayedLegalName += ' ' + this.lastNameField;
        }
      },
      {
        class: 'Boolean',
        name: 'isEditingPhone',
        value: false,
        postSet: function(oldValue, newValue) {
          this.displayedPhoneNumber = '';
          if ( this.countryCode ) this.displayedPhoneNumber = this.countryCode;
          if ( this.phoneNumber ) this.displayedPhoneNumber += ' ' + this.phoneNumber;
        }
      },
      // {
      //   name: 'editingContact',
      //   postSet: function(oldValue, newValue) {
      //     if ( newValue != null ) this.editPrincipalOwner(newValue, true);
      //     this.tableViewElement.selection = newValue;
      //   }
      // },
      {
        name: 'sendEmail',
        class: 'Boolean',
        // postSet: function(oldValue, newValue) {
        //   console.log('changing --');
        // }
      },
      {
        class: 'String',
        name: 'displayedLegalName',
        value: ''
      },
      'nameFieldElement',
      {
        class: 'String',
        name: 'firstNameField',
        value: ''
      },
      {
        class: 'String',
        name: 'middleNameField',
        value: ''
      },
      {
        class: 'String',
        name: 'lastNameField',
        value: ''
      },
      {
        name: 'emailAddress',
        class: 'String'
      },
      // {
      //   name: 'confirmEmailAddress',
      //   class: 'String'
      // },
      {
        name: 'displayedPhoneNumber',
        class: 'String',
        value: '+1'
      },
      {
        name: 'countryCode',
        class: 'String',
        value: '+1'
      },
      {
        name: 'phoneNumber',
        class: 'String'
      },
      {
        name: 'companyName',
        class: 'String'
      },
      {
        name: 'isEdit',
        class: 'Boolean',
        // postSet: function(oldValue, newValue) {
        //   // if ( newValue ) this.editingContact = null;
        //   this.editStart();
        // }
      },
      'phoneFieldElement'
    ],

    messages: [
      { name: 'Title', message: 'Add a Contact' },
      { name: 'TitleEdit', message: 'Edit a Contact' },
      { name: 'Description', message: 'Please Fill Contact Details' },
      { name: 'LegalNameLabel', message: 'Name' },
      { name: 'FirstNameLabel', message: 'First Name' },
      { name: 'MiddleNameLabel', message: 'Middle Initials (optional)' },
      { name: 'LastNameLabel', message: 'Last Name' },
      { name: 'EmailLabel', message: 'Email' },
      { name: 'sendEmailLabel', message: 'Send an Email Invitation' },
      { name: 'CountryCodeLabel', message: 'Country Code' },
      { name: 'PhoneNumberLabel', message: 'Phone Num.' },
      { name: 'successEmail', message: 'Contact successfully Created :)' },
      { name: 'success', message: 'Contact successfully Created :)' },
      { name: 'Job', message: 'Company Name' }

    ],

    methods: [
      function initE() {
        this.SUPER();
        var self = this;
        // var modeSlotSameAs = this.slot(function(isEdit) {
        //   return ( this.isEdit ) ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
        // });
        if ( this.isEdit ) {this.editStart();}
        this
          .addClass(this.myClass())
          .start()
            .start().addClass('container')
              .start().addClass('popUpHeader')
                .start().add(this.TitleEdit).show(self.isEdit).addClass('popUpTitle').end()
                .start().add(this.Title).show( ! self.isEdit).addClass('popUpTitle').end()
                .add(this.CLOSE_BUTTON)
              .end()
          .start().addClass('innerContainer')
              .start('p').add(this.Description).addClass('description').end()

              // Company Name field Render
              .start()
                .start('p').add(this.Job).addClass('label').end()
                .start(this.COMPANY_NAME).addClass('largeInput')
                  .on('focus', function() {
                    self.isEditingPhone = false;
                    self.isEditingName = false;
                  })
                .end()
              .end()

              .start('div').addClass('nameContainer')
              .start('div')
                .addClass('nameDisplayContainer')
                .enableClass('hidden', this.isEditingName$)
                  .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()
                  .start(this.DISPLAYED_LEGAL_NAME)
                    .addClass('legalNameDisplayField')
                    .on('focus', function() {
                      this.blur();
                      self.nameFieldElement && self.nameFieldElement.focus();
                      self.isEditingName = true;
                      self.isEditingPhone = false;
                    })
                  .end()
              .end()
              .start('div')
                .addClass('nameInputContainer')
                .enableClass('hidden', this.isEditingName$, true)
                  .start('div')
                    .addClass('nameFieldsCol')
                    .enableClass('firstName', this.isEditingName$, true)
                      .start('p').add(this.FirstNameLabel).addClass('infoLabel').end()
                      .start(this.FIRST_NAME_FIELD, this.nameFieldElement$)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                  .end()
                  .start('div')
                    .addClass('nameFieldsCol')
                    .enableClass('middleName', this.isEditingName$, true)
                      .start('p').add(this.MiddleNameLabel).addClass('infoLabel').end()
                      .start(this.MIDDLE_NAME_FIELD)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                  .end()
                  .start('div')
                    .addClass('nameFieldsCol')
                    .enableClass('lastName', this.isEditingName$, true)
                      .start('p').add(this.LastNameLabel).addClass('infoLabel').end()
                      .start(this.LAST_NAME_FIELD)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                  .end()
              .end()
            .end()
            .start('div')
              .on('click', function() {
                self.notEditingName();
                self.notEditingPhone();
              })
              .start()
                .start('p').add(this.EmailLabel).addClass('label').end()
                .start(this.EMAIL_ADDRESS).addClass('largeInput')
                  .on('focus', function() {
                    self.isEditingPhone = false;
                    self.isEditingName = false;
                  })
                .end()
              .end()
              // .start()
              //   .start('p').add(this.ConfirmEmailLabel).addClass('label').end()
              //   .start(this.CONFIRM_EMAIL_ADDRESS).addClass('largeInput')
              //     .on('focus', function() {
              //       self.isEditingPhone = false;
              //       self.isEditingName = false;
              //     })
              //     .on('paste', function(e) {
              //       e.preventDefault();
              //     })
              //   .end()
              // .end()
            .end()
            .start()
              .addClass('nameContainer')
              .start()
                .addClass('nameDisplayContainer')
                .enableClass('hidden', this.isEditingPhone$)
                .start('p').add(this.PhoneNumberLabel).addClass('label').end()
                .start(this.DISPLAYED_PHONE_NUMBER)
                  .addClass('legalNameDisplayField')
                  .on('focus', function() {
                    this.blur();
                    self.phoneFieldElement && self.phoneFieldElement.focus();
                    self.isEditingPhone = true;
                    self.isEditingName = false;
                  })
                .end()
              .end()
              .start('div')
                .addClass('nameInputContainer')
                .enableClass('hidden', this.isEditingPhone$, true)
                .start('div')
                  .addClass('phoneFieldsCol')
                  .enableClass('firstName', this.isEditingPhone$, true)
                  .start().add(this.CountryCodeLabel).addClass('label').style({ 'margin-bottom': '8px' }).end()
                  .start(this.COUNTRY_CODE)
                    .addClass('countryCodeInput')
                    .on('click', function() {
                      self.isEditingPhone = true;
                    })
                  .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('middleName', this.isEditingPhone$, true)
                  .start('p').add(this.PhoneNumberLabel).addClass('label').end()
                  .start(this.PHONE_NUMBER, { placeholder: 'format: 000-000-0000' }, this.phoneFieldElement$)
                    .addClass('phoneNumberInput')
                    .on('click', function() {
                      self.isEditingPhone = true;
                    })
                    .on('focusout', function() {
                      self.isEditingPhone = false;
                    })
                  .end()
                .end()
              .end()
            .end()
            .start('div')
              .start()
                .tag({ class: 'foam.u2.CheckBox', data$: self.sendEmail$ })
                .add(self.sendEmailLabel)
              .end()
              .add(this.ADD_BUTTON)
            .end()
          .end()
          .end();
      },

      function validations() {
        if ( this.companyName > 70 ) {
          this.add(this.NotificationMessage.create({ message: 'Company Name cannot exceed 70 characters.', type: 'error' }));
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
        if ( this.middleNameField ) {
          if ( this.middleNameField.length > 70 ) {
            this.add(this.NotificationMessage.create({ message: 'Middle initials cannot exceed 70 characters.', type: 'error' }));
            return false;
          }
          if ( /\d/.test(this.middleNameField) ) {
            this.add(this.NotificationMessage.create({ message: 'Middle initials cannot contain numbers', type: 'error' }));
            return false;
          }
        }
        if ( this.lastNameField.length > 70 ) {
          this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
          return false;
        }
        if ( /\d/.test(this.lastNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'Last name cannot contain numbers.', type: 'error' }));
          return false;
        }
        if ( ! this.validateEmail(this.emailAddress) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
          return false;
        }
        // if ( this.emailAddress != this.confirmEmailAddress ) {
        //   this.add(this.NotificationMessage.create({ message: 'Confirmation email does not match.', type: 'error' }));
        //   return false;
        // }
        if ( ! this.validatePhone(this.countryCode + ' ' + this.phoneNumber) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
          return false;
        }

        return true;
      },

      function extractPhoneNumber(phone) {
        return phone.number.substring(2);
      },

      function extractCtryCode(phone) {
        return '+' + phone.number.substring(0, 1);
      },

      function editStart() {
        debugger;
        this.firstNameField  = this.data.firstName;
        this.middleNameField = this.data.middleName;
        this.lastNameField   = this.data.lastName;
        this.isEditingName   = false;
        this.companyName     = this.data.jobTitle;
        this.emailAddress    = this.data.email;
        //this.countryCode     = this.data.countryCode;
        this.isEditingPhone  = false;
        this.phoneNumber     = this.extractPhoneNumber(this.data.phone);
        this.countryCode     = this.extractCtryCode(this.data.phone);
        this.displayedPhoneNumber = this.data.phoneNumber;
      },

      // function editContact(user, editable) {
      //   var formHeaderElement = this.document.getElementsByClassName('sectionTitle')[0];
      //   formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      //   this.isSameAsAdmin = false;
  
      //   this.firstNameField = user.firstName;
      //   this.middleNameField = user.middleName;
      //   this.lastNameField = user.lastName;
      //   this.isEditingName = false; // This will change displayedLegalName as well
      //   this.companyName = user.jobTitle;
      //   this.emailAddressField = user.email;
      //   this.phoneNumberField = this.extractPhoneNumber(user.phone);
      //   this.countryCode     = user.countryCode;
      //   this.isEditingPhone = false;
  
      //   this.countryField = user.address.countryId;
      // },

      function addContact() {
        var self = this;

        if ( ( this.firstNameField == null || this.firstNameField.trim() == '' ) ||
        ( this.lastNameField == null || this.lastNameField.trim() == '' ) ||
        ( this.companyName == null || this.companyName.trim() == '' ) ||
        ( this.emailAddress == null || this.emailAddress.trim() == '' ) ||
        // ( this.confirmEmailAddress == null || this.confirmEmailAddress.trim() == '' ) ||
        ( this.countryCode == null || this.countryCode.trim() == '' ) ||
        ( this.phoneNumber == null || this.phoneNumber.trim() == '' ) ) {
          this.add(this.NotificationMessage.create({ message: 'Please fill out all fields before proceeding.', type: 'error' }));
          return;
        }

        if ( ! this.validations() ) {
          return;
        }

        var contactPhone = this.Phone.create({
          number: this.countryCode + ' ' + this.phoneNumber
        });

        var newContact = this.User.create({
          firstName: this.firstNameField,
          middleName: this.middleNameField,
          lastName: this.lastNameField,
          email: this.emailAddress,
          type: 'Contact',
          jobTitle: this.companyName,
          spid: this.user.spid,
          status: this.AccountStatus.PENDING,
          compliance: this.ComplianceStatus.REQUESTED,
          phone: contactPhone
        });

        if ( newContact.errors_ ) {
          this.add(this.NotificationMessage.create({ message: newContact.errors_[0][1], type: 'error' }));
          return;
        }
        if ( contactPhone.errors_ ) {
          this.add(this.NotificationMessage.create({ message: contactPhone.errors_[0][1], type: 'error' }));
          return;
        }

        var msgSlot = this.slot(function(sendEmail) {
          console.log(`@msgSlot - sendEmail = ${sendEmail}`);
            return sendEmail ? self.successEmail : self.success;
          });

        if ( self.sendEmail ) {
          this.inviteToken.generateToken(null, newContact).then(function(result) {
            if ( ! result ) throw new Error();
            console.log(`@generateToken - result = ${result}`);
            // self.add(this.NotificationMessage.create({ message: self.success }));
          }).catch(function(error) {
            if ( error.message ) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
              return;
            }
            self.add(self.NotificationMessage.create({ message: 'Adding the Contact failed.', type: 'error' }));
          });
        }
        self.add(this.NotificationMessage.create({ message$: msgSlot }));
        self.closeDialog();//.CLOSE_BUTTON
        self.inClass = true;
      },

      function notEditingName() {
        this.isEditingName = false;
      },

      function notEditingPhone() {
        this.isEditingPhone = false;
      }
    ],

    actions: [
      {
        name: 'closeButton',
        icon: 'images/ic-cancelwhite.svg',
        code: function(X) {
          X.closeDialog();
          this.inClass = true;
        }
      },
      {
        name: 'addButton',
        label: 'Add',
        code: function(X) {
          this.addContact();
        }
      }
    ]
  });
