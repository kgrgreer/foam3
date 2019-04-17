foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'PersonalIdentificationView',
  extends: 'foam.u2.View',

  documentation: 'View displaying fields for personal identification input.',

  requires: [
    'foam.nanos.auth.Country',
    'net.nanopay.model.PersonalIdentification'
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
          .start()
            .addClass('label')
            .add(this.ID_LABEL)
          .end()
          .tag(this.PersonalIdentification.IDENTIFICATION_TYPE_ID, { placeholder: '- Please Select -' })
        .end()
        .start()
          .addClass('label-input')
          .start()
            .addClass('label')
            .add(this.IDENTIFICATION_NUMBER_LABEL)
          .end()
          .tag(this.PersonalIdentification.IDENTIFICATION_NUMBER)
        .end()
        .start()
          .addClass('label-input-half')
          .enableClass('changingField', this.isPassport$)
          .start()
            .addClass('label')
            .add(this.COUNTRY_OF_ISSUE_LABEL)
          .end()
            .add(this.data.identificationTypeId$.map((identificationType) => {
              return this.E()
                .tag(this.data.COUNTRY_ID.clone().copyFrom({
                  view: {
                    class: 'foam.u2.view.ChoiceView',
                    placeholder: '- Please select -',
                    dao: this.isPassport // Passports from any country can be used.
                      ? this.countryDAO
                      : this.countryDAO.where(this.data.OR(
                        this.data.EQ(this.Country.NAME, 'Canada'),
                        this.data.EQ(this.Country.NAME, 'USA')
                      )),
                    objToChoice: function(a) {
                      return [a.id, a.name];
                    }
                  }
                }));
            }))
          .endContext()
        .end()
        .start()
          .hide(this.isPassport$)
          .addClass('label-input-half')
          .addClass('float-right')
          .start()
            .addClass('label')
            .add(this.REGION_OF_ISSUE_LABEL)
          .end()
          .tag(this.PersonalIdentification.REGION_ID)
        .end()
        .start()
          .addClass('label-input-half')
          .start()
            .addClass('label')
            .add(this.DATE_ISSUED_LABEL)
          .end()
          .tag(this.PersonalIdentification.ISSUE_DATE)
        .end()
        .start()
          .addClass('label-input-half')
          .addClass('float-right')
          .start()
            .addClass('label')
            .add(this.EXPIRE_LABEL)
          .end()
          .tag(this.PersonalIdentification.EXPIRATION_DATE)
        .end();
    }
  ]
});
