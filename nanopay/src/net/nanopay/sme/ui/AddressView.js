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
    ^ .side-by-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
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
    { name: 'POSTAL_CODE_LABEL', message: 'Postal Code/Zip Code' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      // Queried out American states from state/province list that are not supported by AscendantFX
      var choices = this.data$.dot('countryId').map(function(countryId) {
        if ( countryId == 'US' ) {
          return self.regionDAO.where(
            self.AND(
              self.EQ(self.Region.COUNTRY_ID, countryId || ''),
              self.NOT(
                self.IN(self.Region.NAME, ['Alaska', 'Hawaii', 'Utah', 'South Dakota', 'Iowa',
                  'Arkansas', 'Louisiana', 'Mississippi', 'South Carolina',
                  'West Virginia', 'Ohio', 'Michigan', 'Rhode Island', 'Vermont']
                )
              )
            )
          );
        } else {
          return self.regionDAO.where(self.EQ(self.Region.COUNTRY_ID, countryId || ''));
        }
      });

      this
        .addClass(this.myClass())
        .start()
          .addClass('side-by-side')
          .start().addClass('label-input')
            .start().addClass('label').add(this.COUNTRY_LABEL).end()
            .start(this.Address.COUNTRY_ID.clone().copyFrom({
              view: {
                class: 'foam.u2.view.ChoiceView',
                placeholder: '- Please select -',
                dao: self.countryDAO.where(self.OR(
                  self.EQ(self.Country.NAME, 'Canada'),
                  self.EQ(self.Country.NAME, 'USA')
                )),
                objToChoice: function(a) {
                  return [a.id, a.name];
                },
                mode$: this.mode$
              }
            }))
            .end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PROVINCE_LABEL).end()
            .start(this.Address.REGION_ID.clone().copyFrom({
              view: {
                class: 'foam.u2.view.ChoiceView',
                placeholder: '- Please select -',
                objToChoice: function(region) {
                  return [region.id, region.name];
                },
                dao$: choices,
                mode$: this.mode$
              }
            }))
            .end()
          .end()
        .end()
        .start()
          .addClass('side-by-side')
          .start().addClass('label-input')
            .start().addClass('label').add(this.STREET_NUMBER_LABEL).end()
            .start(this.Address.STREET_NUMBER, { mode$: this.mode$ }).addClass('input-field').end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.STREET_NAME_LABEL).end()
            .start(this.Address.STREET_NAME, { mode$: this.mode$ }).addClass('input-field').end()
          .end()
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.ADDRESS_LABEL).end()
          .start(this.Address.SUITE, { mode$: this.mode$ }).addClass('input-field').end()
        .end()
        .start()
          .addClass('side-by-side')
          .start().addClass('label-input')
            .start().addClass('label').add(this.CITY_LABEL).end()
            .start(this.Address.CITY, { mode$: this.mode$ }).addClass('input-field').end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.POSTAL_CODE_LABEL).end()
            .start(this.Address.POSTAL_CODE, { mode$: this.mode$ }).addClass('input-field').end()
          .end()
        .end();
    }
  ]
});
