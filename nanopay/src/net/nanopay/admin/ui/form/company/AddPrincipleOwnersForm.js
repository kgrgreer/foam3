foam.CLASS({
  package: 'net.nanopay.admin.ui.form.company',
  name: 'AddPrincipleOwnersForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Principle Owner(s)',

  css:`
    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;

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
      // transform: translateX(64px);//translateX(-166.66px);
    }
    ^ .nameFieldsCol.middleName {
      opacity: 0;
      transform: translateX(-166.66px);//translateX(64px);
    }
    ^ .nameFieldsCol.lastName {
      opacity: 0;
      transform: translateX(-166.66px);//translateY(64px);//translateX(166.66px);
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

    ^ .inputSmall {
      display: inline-block;

      width: 125px;

      margin-right: 20px;
    }

    ^ .inputMedium {
      display: inline-block;

      width: 393px;
    }

    ^ .inputLarge {
      width: 540px;
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
                  .addClass('legalNameDisplayField')
                  .on('focus', function() {
                    this.blur();
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
                    .start(this.FIRST_NAME_FIELD, { tabIndex: 2 })
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
                    .start(this.MIDDLE_NAME_FIELD, { tabIndex: 3 })
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
                    .start(this.LAST_NAME_FIELD, { tabIndex: 4 })
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
            })

            .start('p').add(this.JobTitleLabel).addClass('infoLabel').end()

            .start('p').add(this.EmailAddressLabel).addClass('infoLabel').end()

            .start('p').add(this.PhoneNumberLabel).addClass('infoLabel').end()

            .start('p').add(this.PrincipleTypeLabel).addClass('infoLabel').end()

            .start('p').add(this.DateOfBirthLabel).addClass('infoLabel').end()

            .start('p').add(this.ResidentialAddressLabel).addClass('sectionTitle').end()
            .start('p').add(this.CountryLabel).addClass('infoLabel').end()

            .start('div').addClass('streetContainer')
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNumberLabel).addClass('infoLabel').end()
              .end()
              .start('div').addClass('streetFieldCol')
                .start('p').add(this.StreetNameLabel).addClass('infoLabel').end()
              .end()
            .end()

            .start('p').add(this.AddressLabel).addClass('infoLabel').end()

            .start('p').add(this.ProvinceLabel).addClass('infoLabel').end()

            .start('p').add(this.CityLabel).addClass('infoLabel').end()

            .start('p').add(this.PostalCodeLabel).addClass('infoLabel').end()

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
      }
    }
  ]
});
