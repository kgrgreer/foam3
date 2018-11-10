foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'PersonalIdentificationView',
  extends: 'foam.u2.View',

  documentation: 'View displaying fields for personal identification input.',

  requires: [
    'net.nanopay.model.PersonalIdentification'
  ],

  css: `
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
  `,

  messages: [
    { name: 'ID_LABEL', message: 'Type of Identification' },
    { name: 'IDENTIFICATION_NUMBER_LABEL', message: 'Identification Number' },
    { name: 'COUNTRY_OF_ISSUE_LABEL', message: 'Country of Issue' },
    { name: 'REGION_OF_ISSUE_LABEL', message: 'Province of Issue' },
    { name: 'DATE_ISSUED_LABEL', message: 'Date Issued' },
    { name: 'EXPIRE_LABEL', message: 'Expiry Date' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
      .start().addClass('label-input')
        .start().addClass('label').add(this.ID_LABEL).end()
        .start(this.PersonalIdentification.IDENTIFICATION_TYPE_ID).end()
      .end()
      .start().addClass('label-input')
        .start().addClass('label').addClass('label-width').add(this.IDENTIFICATION_NUMBER_LABEL).end()
        .start(this.PersonalIdentification.IDENTIFICATION_NUMBER).end()
      .end()
      .start().addClass('label-input-half')
        .start().addClass('label').add(this.COUNTRY_OF_ISSUE_LABEL).end()
          .start(this.PersonalIdentification.COUNTRY_ID).end()
        .endContext()
      .end()
      .start().addClass('label-input-half')
        .start().addClass('label').add(this.REGION_OF_ISSUE_LABEL).end()
        .start(this.PersonalIdentification.REGION_ID).end()
      .end()
      .start().addClass('label-input-half')
        .start().addClass('label').add(this.REGION_OF_ISSUE_LABEL).end()
        .start(this.PersonalIdentification.ISSUE_DATE).end()
      .end()
      .start().addClass('label-input-half')
        .start().addClass('label').add(this.REGION_OF_ISSUE_LABEL).end()
        .start(this.PersonalIdentification.EXPIRATION_DATE).end()
      .end();
    }
  ]
});
