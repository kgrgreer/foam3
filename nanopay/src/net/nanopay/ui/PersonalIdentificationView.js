foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'PersonalIdentificationView',
  extends: 'foam.u2.View',

  documentation: 'View displaying fields for personal identification input.',

  requires: [
    'foam.nanos.auth.Country',
    'net.nanopay.model.PersonalIdentification',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'countryDAO',
    'identificationTypeDAO'
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
    ^ .label-input-half {
      width: 45%;
      display: inline-block;
    }
    ^ .foam-u2-DateView {
      width: 100%;
      height: 35px;
    }
    ^ .changingField {
      width: 100%;
    }
  `,

  messages: [
    { name: 'ID_LABEL', message: 'Type of Identification' },
    { name: 'IDENTIFICATION_NUMBER_LABEL', message: 'Identification Number' },
    { name: 'COUNTRY_OF_ISSUE_LABEL', message: 'Country of Issue' },
    { name: 'REGION_OF_ISSUE_LABEL', message: 'Province/State of Issue' },
    { name: 'DATE_ISSUED_LABEL', message: 'Date Issued' },
    { name: 'EXPIRE_LABEL', message: 'Expiry Date' }
  ],

  properties: [
    {
      name: 'isPassport',
      expression: function(data$identificationTypeId) {
        return data$identificationTypeId === 3;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass('label-input')
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.PersonalIdentification.IDENTIFICATION_TYPE_ID
          })
        .end()
        .start()
          .addClass('label-input')
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.PersonalIdentification.IDENTIFICATION_NUMBER
          })
        .end()
        .start()
          .addClass('label-input-half')
          .enableClass('changingField', this.isPassport$)
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.PersonalIdentification.COUNTRY_ID
          })
        .end()
        .start()
          .hide(this.isPassport$)
          .addClass('label-input-half')
          .addClass('float-right')
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.PersonalIdentification.REGION_ID
          })
        .end()
        .start()
          .addClass('label-input-half')
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.PersonalIdentification.ISSUE_DATE
          })
        .end()
        .start()
          .addClass('label-input-half')
          .addClass('float-right')
          .tag(this.SectionedDetailPropertyView, {
            data$: this.data$,
            prop: this.PersonalIdentification.EXPIRATION_DATE
          })
        .end();
    }
  ]
});
