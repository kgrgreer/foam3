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
    { name: 'WEBSITE_LABEL', message: 'Website' }
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
          .start().addClass('table-content').addClass('subdued-text').add(this.user.phone.number).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.ADDRESS_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.address.getAddress()).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.WEBSITE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.website).end()
        .end()
    }
  ]
});
