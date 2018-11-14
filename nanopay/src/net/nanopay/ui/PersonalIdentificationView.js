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
  `,

  properties: [
    {
      name: 'identificationType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please select -',
          dao: X.identificationTypeDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      name: 'countryField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          placeholder: '- Please select -',
          dao: X.countryDAO.where(X.data.OR(
            X.data.EQ(X.data.Country.NAME, 'Canada'),
            X.data.EQ(X.data.Country.NAME, 'USA')
          )),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      },
      factory: function() {
        return this.data.countryId ? this.data.countryId : this.Country.create({});
      },
      postSet: function(o, n) {
        this.data.countryId = n;
      }
    }
  ],

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
      this.SUPER();
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
          .startContext({ data: this })
            .start(this.COUNTRY_FIELD).end()
          .endContext()
      .end()
      .start().addClass('label-input-half').addClass('float-right')
        .start().addClass('label').add(this.REGION_OF_ISSUE_LABEL).end()
        .start(this.PersonalIdentification.REGION_ID).end()
      .end()
      .start().addClass('label-input-half')
        .start().addClass('label').add(this.DATE_ISSUED_LABEL).end()
        .start(this.PersonalIdentification.ISSUE_DATE).end()
      .end()
      .start().addClass('label-input-half').addClass('float-right')
        .start().addClass('label').add(this.EXPIRE_LABEL).end()
        .start(this.PersonalIdentification.EXPIRATION_DATE).end()
      .end();
    }
  ]
});
