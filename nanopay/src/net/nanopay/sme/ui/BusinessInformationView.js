foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessInformationView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business information.
  `,

  imports: [
    'user'
  ],

  css: `
    ^ {
      padding: 24px;
    }
    ^ .info-container {
      width: 25%;
      display: inline-grid;
      height: 40px;
      margin-top: 30px;
    }
    ^ .table-content {
      height: 21px;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Company information' },
    { name: 'BUSINESS_NAME_LABEL', message: 'Registered business name' },
    { name: 'PHONE_LABEL', message: 'Business phone #' },
    { name: 'ADDRESS_LABEL', message: 'Business address' },
    { name: 'WEBSITE_LABEL', message: 'Website' },
    { name: 'REGISTRATION_NUMBER_LABEL', message: 'Business registration #' },
    { name: 'REGISTRATION_AUTHORITY_LABEL', message: 'Registration authority' },
    { name: 'REGISTRATION_DATE_LABEL', message: 'Registration date' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).addClass('card')
        .start().addClass('sub-heading').add(this.TITLE).end()
        // TODO: Edit Business
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.BUSINESS_NAME_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.organization).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.PHONE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessPhone.number).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.ADDRESS_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessAddress.getAddress()).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.WEBSITE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.website).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.REGISTRATION_NUMBER_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessRegistrationNumber).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.REGISTRATION_AUTHORITY_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessRegistrationAuthority).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.REGISTRATION_DATE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessRegistrationDate).end()
        .end();
    }
  ]
});
