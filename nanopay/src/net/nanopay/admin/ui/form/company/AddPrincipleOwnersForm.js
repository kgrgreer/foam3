foam.CLASS({
  package: 'net.nanopay.admin.ui.form.company',
  name: 'AddCompanyInfoForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Principle Owner(s)',

  css:`
    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;

      margin-bottom: 20px;
    }

    ^ .streetContainer {
      width: 540px;
    }

    ^ .streetFieldCol {
      display: inline-block;
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
  `,

  messages: [
    { name: 'BasicInfoLabel', message: 'Basic Information' },
    { name: 'LegalNameLabel', message: 'Legal Name' },
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

  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('div')
          // TABLE SHOULD GO HERE
          .start('p').add(this.BasicInfoLabel).addClass('sectionTitle').end()
          .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()

          .start('p').add(this.JobTitleLabel).addClass('infoLabel').end()

          .start('p').add(this.EmailAddressLabel).addClass('infoLabel').end()

          .start('p').add(this.PhoneNumberLabel).addClass('infoLabel').end()

          .start('p').add(this.PrincipleTypeLabel.addClass('infoLabel').end()

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

        .end();
    }
  ],

  actions: [
    {
      name: 'addPrincipleOwner',
      label: 'Add',
      code: function() {
        
      }
    }
  ]
});
