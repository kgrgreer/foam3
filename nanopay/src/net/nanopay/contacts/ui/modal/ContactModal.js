// FUTURE: make send email invite specific to ablii
// Example Usage: for editing: this.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.ContactModal', data: contact, isEdit: true }));
//                              @param data: must be User-Contact
//
//                for creating: self.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.ContactModal' }));
//                for deleting: self.add(this.Popup.create().tag({ class: 'net.nanopay.contacts.ui.modal.ContactModal', data: contact, isDelete: true }));

foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactModal',
  extends: 'foam.u2.Controller',

  documentation: 'View for adding a Contact',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.CheckBox',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.contacts.Contact'
  ],

  imports: [
    'ctrl',
    'user',
    'validateEmail',
    'validateTitleNumOrAuth'
  ],

  css: `
    ^ .container {
       width: 570px;
    }
    ^ .innerContainer {
      width: 540px;
      margin: 10px;
    }
    ^ .nameContainer {
      position: relative;
      height: 64px;
      width: 100%;
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
      margin-bottom: -1.5px;
    }
    ^ .nameDisplayContainer {
      position: absolute;
      top: 15px;
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
    }
    ^ .nameFieldsCol.first {
      opacity: 0;
    }
    ^ .nameFieldsCol.middle {
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
    ^ .whiteBox{
      color: #999999;
    }
    ^ .net-nanopay-ui-ActionView-closeButton {
      width: 24px;
      height: 24px !important;
      margin: 0;
      margin-top: 7px;
      margin-right: 50px;
      cursor: pointer;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      box-shadow: none;
    }
    ^ .net-nanopay-ui-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
    ^ .net-nanopay-ui-ActionView-addButton {
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-addButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-saveButton {
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      width: 100%;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-deleteButton {
      border-radius: 2px;
      background-color: %SECONDARYCOLOR%;
      color: white;
      width: 100%;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    ^ .net-nanopay-ui-ActionView-deleteButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-redDeleteButton {
      border-radius: 2px;
      background-color: red; // %SECONDARYCOLOR%;
      color: white;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
      margin-right: 40px;
      margin-left: 20px;
    }
    ^ .net-nanopay-ui-ActionView-redDeleteButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
    ^ .net-nanopay-ui-ActionView-cancelDeleteButton {
      border-radius: 2px;
      background-color: green; // %SECONDARYCOLOR%;
      color: white;
      vertical-align: middle;
      margin-top: 10px;
      margin-bottom: 20px;
      margin-left: 40px;
      margin-right: 20px;
    }
    ^ .net-nanopay-ui-ActionView-cancelDeleteButton:hover {
      background: %SECONDARYCOLOR%;
      opacity: 0.9;
    }
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
    ^ .styleMargin {
      margin-top: 8%;
    }
    ^ .modal-checkbox-wrapper {
      margin-top: 16px;
    }
  `,

  properties: [
    {
      name: 'data',
      of: 'net.nanopay.contacts.Contact',
      value: null
    },
    {
      class: 'String',
      name: 'companyName'
    },
    {
      class: 'Boolean',
      name: 'completeSoClose',
      documentation: `
      Purpose: To closeDialog (ie ContactModal) right after the call to the add or save functions.
      There are two actions where this is used.
      1) Add 
      2) Save 
      Without this property the view would auto close whether add or save was successful or not. 
      This ensures that only with success of add or save will the ContactModal close.`
    },
    {
      class: 'Boolean',
      name: 'confirmDelete',
      documentation: `
      Used under editView of ContactModal (ie isEdit = true). Once a User decideds to delete contact
      a confirmation modal is activated, asking to confirm delete. If User decideds to delete contact then
      confirmDelete = true. Triggering the deletion of Contact from user.contacts`
    },
    {
      class: 'Long',
      name: 'contactID',
      value: -1
    },
    {
      class: 'String',
      name: 'displayedLegalName',
      value: ''
    },
    {
      class: 'String',
      name: 'emailAddress'
    },
    {
      class: 'String',
      name: 'firstNameField',
      value: ''
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `
      Variable used to edit the view of ContactModal. isEdit = false, ensures that ContactModal
      displays Contact creation. isEdit = true, then switches view of ContactModal to edit view of Contact`
    },
    {
      class: 'Boolean',
      name: 'isDelete',
      documentation: `
      Variable used to pull delete modal for Contact.
      `
    },
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedLegalName = '';
        if ( this.firstNameField ) {
          this.displayedLegalName += this.firstNameField;
        }
        if ( this.middleNameField ) {
          this.displayedLegalName += ' ' + this.middleNameField;
        }
        if ( this.lastNameField ) {
          this.displayedLegalName += ' ' + this.lastNameField;
        }
      }
    },
    {
      class: 'String',
      name: 'lastNameField',
      value: ''
    },
    {
      class: 'String',
      name: 'middleNameField',
      value: ''
    },
    'nameFieldElement',
    {
      class: 'Boolean',
      name: 'sendEmail'
    },
    {
      class: 'Boolean',
      name: 'showProp'
    },
  ],

  messages: [
    { name: 'TITLE', message: 'Add a Contact' },
    { name: 'TITLE_EDIT', message: 'Edit a Contact' },
    { name: 'LEGAL_NAME_LABEL', message: 'Name' },
    { name: 'FIRST_NAME_LABEL', message: 'First Name' },
    { name: 'MIDDLE_NAME_LABEL', message: 'Middle Initials (optional)' },
    { name: 'LAST_NAME_LABEL', message: 'Last Name' },
    { name: 'EMAIL_LABEL', message: 'Email' },
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete ' },
    { name: 'CONFIRM_DELETE_2', message: ' from your contacts list?' },
    { name: 'SEND_EMAIL_LABEL', message: 'Send an Email Invitation' },
    { name: 'JOB', message: 'Company Name' }
  ],

  methods: [
    function init() {
      if ( this.isDelete ) {
        this.confirmDelete = true;
        this.isEdit = true;
      }
      if ( this.isEdit ) this.editStart();
      else this.data = null;
    },

    function initE() {
      var self = this;
      this.SUPER();
      this.addClass(this.myClass())
        .start().hide(self.confirmDelete$)
          .start().addClass('container')
          // Top banner Title and Close [X]
            .start().addClass('popUpHeader')
              .start().add(this.TITLE_EDIT).show(this.isEdit).addClass('popUpTitle').end()
              .start().add(this.TITLE).show( ! this.isEdit).addClass('popUpTitle').end()
              .add(this.CLOSE_BUTTON)
            .end()
            // SubTitle
            .start().addClass('innerContainer')
              // Company Name Field - Required
              .start()
                .start('span').add(this.JOB).addClass('label').end()
                .start(this.COMPANY_NAME).addClass('largeInput')
                  .on('focus', function() {
                    self.isEditingName = false;
                  })
                .end()
              .end()
              // Name Field - Required
              .start().addClass('nameContainer')
                .start()
                  .addClass('nameDisplayContainer')
                  .hide(this.isEditingName$)
                  .start('span').add(this.LEGAL_NAME_LABEL).addClass('infoLabel').end()
                    .start(this.DISPLAYED_LEGAL_NAME)
                      .addClass('legalNameDisplayField')
                        .on('focus', function() {
                          self.blur();
                          self.nameFieldElement && self.nameFieldElement.focus();
                          self.isEditingName = true;
                        })
                    .end()
                  .end()
                  .start()
                  // Edit Name: on focus seperates First, Middle, Last names Fields
                  // First and Last Name - Required
                    .addClass('nameInputContainer')
                    .enableClass('hidden', this.isEditingName$, true)
                    .start()
                      .addClass('nameFieldsCol')
                      .enableClass('first', this.isEditingName$, true)
                      .start('span').add(this.FIRST_NAME_LABEL).addClass('infoLabel').end()
                      .start(this.FIRST_NAME_FIELD, this.nameFieldElement$)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                    .end()
                    .start()
                      .addClass('nameFieldsCol')
                      .enableClass('middle', this.isEditingName$, true)
                      .start('p').add(this.MIDDLE_NAME_LABEL).addClass('infoLabel').end()
                      .start(this.MIDDLE_NAME_FIELD)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                    .end()
                    .start()
                      .addClass('nameFieldsCol')
                      .enableClass('lastName', this.isEditingName$, true)
                      .start('span').add(this.LAST_NAME_LABEL).addClass('infoLabel').end()
                      .start(this.LAST_NAME_FIELD)
                        .addClass('nameFields')
                        .on('click', function() {
                          self.isEditingName = true;
                        })
                      .end()
                    .end()
                .end()
              .end()
              .start()
                .on('click', function() {
                  self.isEditingName = false;
                })
                // Email field - Required
                .start()
                  .hide(this.isEdit)
                  .start('span').add(this.EMAIL_LABEL).addClass('label').end()
                  .start(this.EMAIL_ADDRESS).addClass('largeInput').end()
                .end()
                .start()
                  .show(this.isEdit)
                  .start('span').add(this.EMAIL_LABEL).addClass('label').end()
                  .start()
                    .start(this.EMAIL_ADDRESS, {
                      mode: foam.u2.DisplayMode.DISABLED
                    })
                      .addClass('whiteBox')
                      .addClass('largeInput')
                    .end()
                  .end()
                .end()
              .end()
              .start()
                .addClass('modal-checkbox-wrapper')
                .tag({ class: 'foam.u2.CheckBox', data$: this.sendEmail$ })
                .start('label').add(this.SEND_EMAIL_LABEL).addClass('checkbox-label').end()
              .end()
            .end()
            .start()
              .hide(this.isEdit)
              .addClass('styleMargin')
              .add(this.ADD_BUTTON)
            .end()
            .start()
              .show( this.isEdit )
              .addClass('styleMargin')
              .add(this.SAVE_BUTTON)
            .end()
          .end()
        .end();

        // Confirm DeleteView Below - dependent on property: confirmDelete(boolean)
        this
        .start().addClass(this.myClass()).show(this.confirmDelete$)
          .start().addClass('container')
            .start().addClass('popUpHeader')
              .add(this.CLOSE_BUTTON)
            .end()
            .start().addClass('innerContainer')
              .add(this.CONFIRM_DELETE_1 + this.displayedLegalName + this.CONFIRM_DELETE_2)
            .end()
            .add(this.CANCEL_DELETE_BUTTON)
            .add(this.RED_DELETE_BUTTON)
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
      return true;
    },

    function editStart() {
      var self = this;
      // Option 1: data is not a Contact:
      if ( ! this.Contact.isInstance(this.data) ) {
        self.add(self.NotificationMessage.create({ message: ' DATA NOT RECOGNIZED: Cannot Edit Unknown ' + error.message, type: 'error' }));
        return;
      }
      // Option 2: Contact gets passed as data:
      this.fillData();
    },

    function fillData() {
      this.firstNameField  = this.data.firstName;
      this.middleNameField = this.data.middleName;
      this.lastNameField   = this.data.lastName;
      this.isEditingName   = false;
      this.companyName     = this.data.organization;
      this.emailAddress    = this.data.email;
    },

    function deleteContact() {
      var self = this;
      this.user.contacts.remove(this.data).then(function(result) {
        if ( ! result ) throw new Error();
        ctrl.add(self.NotificationMessage.create({ message: 'Contact deleted.' }));
      }).catch(function(error) {
        if ( error.message ) {
          ctrl.add(self.NotificationMessage.create({ message: 'Deleting the Contact failed: ' + error.message, type: 'error' }));
          return;
        }
        ctrl.add(self.NotificationMessage.create({ message: 'Deleting the Contact failed.', type: 'error' }));
      });
    },

    function isEmptyFields() {
      if ( ( this.firstNameField == null || this.firstNameField.trim() === '' ) ||
      ( this.lastNameField == null || this.lastNameField.trim() === '' ) ||
      ( this.companyName == null || this.companyName.trim() === '' ) ||
      ( this.emailAddress == null || this.emailAddress.trim() === '' ) ) {
        this.add(this.NotificationMessage.create({ message: 'Please fill out all fields before proceeding.', type: 'error' }));
        return true;
      }
      return false;
    },

    function addUpdateContact() {
      var self = this;
      this.completeSoClose = false;

      if ( this.isEmptyFields() ) return;
      if ( ! this.validations() ) return;

      var newContact = null;
      if ( this.data == null ) {
        newContact = this.Contact.create({
                      firstName: this.firstNameField,
                      middleName: this.middleNameField,
                      lastName: this.lastNameField,
                      email: this.emailAddress,
                      organization: this.companyName,
                      type: 'Contact'
                    });
        this.data = newContact;
      } else {
        // If on EditView of ContactModal, and saving contact Update
        this.data.firstName     = this.firstNameField;
        this.data.middleName    = this.middleNameField,
        this.data.lastName      = this.lastNameField,
        this.data.email         = this.emailAddress,
        this.data.organization  = this.companyName;
        newContact = this.data;
      }
      if ( newContact == null ) return;

      if ( newContact.errors_ ) {
        this.add(this.NotificationMessage.create({ message: newContact.errors_[0][1], type: 'error' }));
        return;
      }

      if ( this.sendEmail ) {
        this.user.contacts.put(newContact);
      } else {
        this.user.contacts.put(newContact).then(function(result) {
          if ( ! result ) throw new Error();
          }).catch(function(error) {
            if ( error.message ) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            } else {
              self.add(self.NotificationMessage.create({ message: 'Adding/Updating the Contact failed.', type: 'error' }));
            }
            return;
          });
      }
      this.completeSoClose = true;
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'addButton',
      label: 'Add',
      code: function(X) {
        this.addUpdateContact();
        if ( this.completeSoClose ) X.closeDialog();
      }
    },
    {
      name: 'saveButton',
      label: 'Save',
      code: function(X) {
        this.addUpdateContact();
          if ( this.completeSoClose ) X.closeDialog();
      }
    },
    {
      name: 'redDeleteButton',
      label: 'Yes, delete it',
      code: function(X) {
        this.deleteContact();
        X.closeDialog();
      }
    },
    {
      name: 'cancelDeleteButton',
      label: 'Nevermind',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
