foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BeneficialOwnerView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business beneficial owner information.
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
    { name: 'TITLE', message: 'Principal owners' },
    { name: 'LEGAL_NAME_LABEL', message: 'Legal name' },
    { name: 'JOB_TITLE_LABEL', message: 'Job title' },
    { name: 'ADDRESS_LABEL', message: 'Residential address' },
    { name: 'EMAIL_LABEL', message: 'Email' },
    { name: 'PRINCIPAL_TYPE_LABEL', message: 'Principal type' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Phone #' },
    { name: 'DATE_OF_BIRTH_LABEL', message: 'Date of birth' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).addClass('card')
        .start().addClass('sub-heading').add(this.TITLE).end()
        // TODO: Edit Business
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.LEGAL_NAME_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.organization).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.JOB_TITLE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessPhone.number).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.ADDRESS_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessAddress.getAddress()).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.EMAIL_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.website).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.PRINCIPAL_TYPE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessRegistrationNumber).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.PHONE_NUMBER_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessRegistrationAuthority).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.DATE_OF_BIRTH_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.businessRegistrationDate).end()
        .end();
    }
  ]
});
