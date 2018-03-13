foam.CLASS({
  package: 'net.nanopay.admin.ui.form.company',
  name: 'AddPrincipleOwnersForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Principle Owner(s)',

  imports: [
    'countryDAO',
    'regionDAO',
    'validateEmail',
    'validatePostalCode',
    'validatePhone',
    'validateAge',
    'validateCity',
    'validateStreetNumber',
    'validateAddress'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Region',
    'foam.u2.dialog.NotificationMessage'
  ],

  css:`
    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;

      margin-top: 30px;
      margin-bottom: 20px;
    }

    ^ .nameContainer {
      position: relative;
      width: 540px;
      height: 64px;
      overflow: hidden;
      box-sizing: border-box;
    }

    ^ .nameDisplayContainer {
      position: absolute;
      top: 0;
      left: 0;

      width: 540px;
      height: 64px;

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
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .fullWidthField {
      width: 540px;
      height: 40px;

      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);

      padding: 12px 13px;

      box-sizing: border-box;
      outline: none;
    }

    ^ .fullWidthField:focus {
      border: solid 1px #59A5D5;
      outline: none;
    }

    ^ .noPadding {
      padding: 0
    }

    ^ .caret {
      position: relative;
      pointer-events: none;
    }

    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 510px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }

    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }

    ^ .displayOnly {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
    }

    ^ .nameInputContainer {
      position: absolute;
      top: 0;
      left: 0;

      width: 540px;
      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      z-index: 9;
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
      margin-bottom: 8px;
    }

    ^ .nameFieldsCol.firstName {
      opacity: 0;
      // transform: translateX(64px);
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
    }

    ^ .streetContainer {
      width: 540px;
    }

    ^ .streetFieldCol {
      display: inline-block;
      margin-right: 20px;
    }

    ^ .streetFieldCol:last-child {
      margin-right: 0;
    }

    ^ .streetNumberField {
      width: 125px;
    }

    ^ .streetNameField {
      width: 395px;
    }

    ^ .net-nanopay-ui-ActionView-addPrincipleOwner {
      width: 540px;
      height: 40px;
      border-radius: 2px;
      background-color: #59a5d5;

      font-size: 14px;

      margin-top: 50px;
    }

    ^ .foam-u2-TextField:focus {
      border: solid 1px #59A5D5;
      outline: none;
    }

    ^ .net-nanopay-ui-ActionView {
      color: white;
    }

    ^ .dropdownContainer {
      width: 540px;
      outline: none;
    }

    ^ .foam-u2-tag-Select {
      width: 540px;
      height: 40px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding: 12px;
      padding-right: 35px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      background-color: white;
      outline: none !important;
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }
  `,

  messages: [
    { name: 'BasicInfoLabel', message: 'Basic Information' },
    { name: 'LegalNameLabel', message: 'Legal Name' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleNameLabel', message: 'Middle Initials(optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailAddressLabel', message: 'Email Address' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' },
    { name: 'PrincipleTypeLabel', message: 'Principle Type' },
    { name: 'DateOfBirthLabel', message: 'Date of Birth' },
    { name: 'ResidentialAddressLabel', message: 'Residential Address' },
    { name: 'CountryLabel', message: 'Country' },
    { name: 'StreetNumberLabel', message: 'Street Number' },
    { name: 'StreetNameLabel', message: 'Street Name' },
    { name: 'AddressLabel', message: 'Address' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'CityLabel', message: 'City' },
    { name: 'PostalCodeLabel', message: 'Postal Code' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'principleOwnerEdit',
      factory: function() {
        return net.nanopay.model.User.create();
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedLegalName = '';
        if ( this.firstNameField ) this.displayedLegalName += this.firstNameField;
        if ( this.middleNameField ) this.displayedLegalName += ' ' + this.middleNameField;
        if ( this.lastNameField ) this.displayedLegalName += ' ' + this.lastNameField;
      }
    },
    {
      class: 'String',
      name: 'displayedLegalName',
      value: ''
    },
    {
      class: 'String',
      name: 'firstNameField',
      value: ''
    },
    'firstNameFieldElement',
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
      class: 'String',
      name: 'jobTitleField',
      value: ''
    },
    {
      class: 'String',
      name: 'emailAddressField',
      value: ''
    },
    {
      name: 'principleTypeField',
      value: 'Shareholder',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'Shareholder', 'Owner', 'Officer', 'To Be Filled Out' ] },
    },
    {
      class: 'Date',
      name: 'birthdayField',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      },
      // factory: function() {
      //   return this.viewData.birthday;
      // },
      // postSet: function(oldValue, newValue) {
      //   this.viewData.birthday = newValue;
      // }
    },
    {
      name: 'countryField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        return this.viewData.country || 'CA';
      },
      // postSet: function(oldValue, newValue) {
      //   this.viewData.country = newValue;
      // }
    },
    {
      class: 'String',
      name: 'streetNumberField',
      value: ''
    },
    {
      class: 'String',
      name: 'streetNameField',
      value: ''
    },
    {
      class: 'String',
      name: 'addressField',
      value: ''
    },
    {
      name: 'provinceField',
      view: function(_, X) {
        var choices = X.data.slot(function (countryField) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryField || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      }
      // factory: function() {
      //   return this.viewData.province;
      // },
      // postSet: function(oldValue, newValue) {
      //   this.viewData.province = newValue;
      // }
    },
    {
      class: 'String',
      name: 'cityField',
      value: ''
    },
    {
      class: 'String',
      name: 'postalCodeField',
      value: ''
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .start('div')
          // TODO: TABLE SHOULD GO HERE
          .start('p').add(this.BasicInfoLabel).addClass('sectionTitle').end()
          .start('div').addClass('nameContainer')
            .start('div')
              .addClass('nameDisplayContainer')
              .enableClass('hidden', this.isEditingName$)
                .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()
                .start(this.DISPLAYED_LEGAL_NAME, { tabIndex: 1 })
                  .addClass('fullWidthField')
                  .addClass('displayOnly')
                  .on('focus', function() {
                    this.blur();
                    self.firstNameFieldElement && self.firstNameFieldElement.focus();
                    self.isEditingName = true;
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
                    .start(this.FIRST_NAME_FIELD, { tabIndex: 2 }, this.firstNameFieldElement$)
                      .addClass('nameFields')
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('middleName', this.isEditingName$, true)
                    .start('p').add(this.MiddleNameLabel).addClass('infoLabel').end()
                    .start(this.MIDDLE_NAME_FIELD, { tabIndex: 3 })
                      .addClass('nameFields')
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('lastName', this.isEditingName$, true)
                    .start('p').add(this.LastNameLabel).addClass('infoLabel').end()
                    .start(this.LAST_NAME_FIELD, { tabIndex: 4 })
                      .addClass('nameFields')
                    .end()
                .end()
            .end()
          .end()

          .start('div')
            .on('click', function() {
              self.notEditingName();
            })

            .start('p').add(this.JobTitleLabel).addClass('infoLabel').end()
            .start(this.JOB_TITLE_FIELD, { tabIndex: 5 }).addClass('fullWidthField').end()
            .start('p').add(this.EmailAddressLabel).addClass('infoLabel').end()
            .start(this.EMAIL_ADDRESS_FIELD, { tabIndex: 6 }).addClass('fullWidthField').end()
            .start('p').add(this.PhoneNumberLabel).addClass('infoLabel').end()
            // TODO: For Phone Number
            .start('p').add(this.PrincipleTypeLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .start(this.PRINCIPLE_TYPE_FIELD, {tabIndex: 8}).end()
              .start('div').addClass('caret').end()
            .end()
            .start('p').add(this.DateOfBirthLabel).addClass('infoLabel').end()
            .start(this.BIRTHDAY_FIELD, { tabIndex: 9 }).addClass('fullWidthField').end()

            // ADDRESS INFO
            .start('p').add(this.ResidentialAddressLabel).addClass('sectionTitle').end()
            .start('p').add(this.CountryLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .start(this.COUNTRY_FIELD, {tabIndex: 10}).end()
              .start('div').addClass('caret').end()
            .end()
            .start('div').addClass('streetContainer')
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNumberLabel).addClass('infoLabel').end()
                .start(this.STREET_NUMBER_FIELD, { tabIndex: 11 }).addClass('fullWidthField').addClass('streetNumberField').end()
              .end()
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNameLabel).addClass('infoLabel').end()
                .start(this.STREET_NAME_FIELD, { tabIndex: 12 }).addClass('fullWidthField').addClass('streetNameField').end()
              .end()
            .end()
            .start('p').add(this.AddressLabel).addClass('infoLabel').end()
            .start(this.ADDRESS_FIELD, { tabIndex: 13 }).addClass('fullWidthField').end()
            .start('p').add(this.ProvinceLabel).addClass('infoLabel').end()
            .start('div').addClass('dropdownContainer')
              .start(this.PROVINCE_FIELD, {tabIndex: 14}).end()
              .start('div').addClass('caret').end()
            .end()
            .start('p').add(this.CityLabel).addClass('infoLabel').end()
            .start(this.CITY_FIELD, { tabIndex: 15 }).addClass('fullWidthField').end()
            .start('p').add(this.PostalCodeLabel).addClass('infoLabel').end()
            .start(this.POSTAL_CODE_FIELD, { tabIndex: 16 }).addClass('fullWidthField').end()
            .start(this.ADD_PRINCIPLE_OWNER).end()
          .end()
        .end();
    },

    function notEditingName() {
      this.isEditingName = false;
    }
  ],

  actions: [
    {
      name: 'addPrincipleOwner',
      label: 'Add',
      code: function() {
        // TODO: Make sure required fields are validated before adding to DAO
        if ( ! this.firstNameField || ! this.lastNameField ) {
          this.add(this.NotificationMessage.create({ message: 'First and last name fields must be populated.', type: 'error' }));
          return;
        }

        if ( ! this.jobTitleField ) {
          this.add(this.NotificationMessage.create({ message: 'Job title field must be populated.', type: 'error' }));
          return;
        }

        if ( ! this.validateEmail(this.emailAddressField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
          return;
        }

        // TODO: validate phone number

        if ( ! this.validateAge(this.birthdayField) ) {
          this.add(this.NotificationMessage.create({ message: 'User must be at least 16 years of age.', type: 'error' }));
          return;
        }

        if ( ! this.validateStreetNumber(this.streetNumberField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
          return;
        }
        if ( ! this.validateAddress(this.streetNameField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
          return;
        }
        if ( this.addressField.length > 0 && ! this.validateAddress(this.addressField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid address line.', type: 'error' }));
          return;
        }
        if ( ! this.validateCity(this.cityField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
          return;
        }
        if ( ! this.validatePostalCode(this.postalCodeField) ) {
          this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
          return;
        }

        // TODO: Add to DAO
      }
    }
  ]
});
