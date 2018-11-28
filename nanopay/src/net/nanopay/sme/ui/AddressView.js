foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AddressView',
  extends: 'foam.u2.View',

  documentation: 'SME specific address view used in forms.',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.Country'
  ],

  imports: [
    'countryDAO',
    'regionDAO'
  ],

  properties: [
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
        // debugger;
        this.data.countryId = n;
      }
    },
    {
      name: 'regionField',
      view: function(_, X) {
        var choices = X.data.slot(function(countryField) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryField || ''));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      },
      factory: function() {
        return this.data.regionId ? this.data.regionId : this.Region.create({});
      },
      postSet: function(o, n) {
        // debugger;
        this.data.regionId = n;
      }
    }
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
    { name: 'COUNTRY_LABEL', message: 'Country' },
    { name: 'STREET_NUMBER_LABEL', message: 'Street Number' },
    { name: 'STREET_NAME_LABEL', message: 'Street Name' },
    { name: 'ADDRESS_LABEL', message: 'Address Line 2' },
    { name: 'ADDRESS_HINT', message: 'Apartment, suite, unit, building, floor, etc.' },
    { name: 'PROVINCE_LABEL', message: 'State/Province' },
    { name: 'CITY_LABEL', message: 'City' },
    { name: 'POSTAL_CODE_LABEL', message: 'Postal Code' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
          .start().addClass('label').add(this.COUNTRY_LABEL).end()
          .startContext({ data: this })
            .start(this.COUNTRY_FIELD).end()
          .endContext()
        .end()
        .start().addClass('label-input').addClass('half-container')
          .start().addClass('label').add(this.PROVINCE_LABEL).end()
          .startContext({ data: this })
            .start(this.REGION_FIELD).end()
          .endContext()
        .end()
        .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
          .start().addClass('label').add(this.STREET_NUMBER_LABEL).end()
          .start(this.Address.STREET_NUMBER).addClass('input-field').end()
        .end()
        .start().addClass('label-input').addClass('half-container')
          .start().addClass('label').add(this.STREET_NAME_LABEL).end()
          .start(this.Address.STREET_NAME).addClass('input-field').end()
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.ADDRESS_LABEL).end()
          .start(this.Address.SUITE).addClass('input-field').end()
        .end()
        .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
          .start().addClass('label').add(this.CITY_LABEL).end()
          .start(this.Address.CITY).addClass('input-field').end()
        .end()
        .start().addClass('label-input').addClass('half-container')
          .start().addClass('label').add(this.POSTAL_CODE_LABEL).end()
          .start(this.Address.POSTAL_CODE).addClass('input-field').end()
        .end();
    }
  ]
});
