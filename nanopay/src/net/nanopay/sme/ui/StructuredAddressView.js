/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'StructuredAddressView',
  extends: 'foam.u2.View',

  documentation: 'Structured view for address',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.AddressConfig',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  imports: [
    'countryDAO',
    'regionDAO',
    'AddressConfigDAO',
    'translationService'
  ],

  css: `
    ^ .foam-u2-tag-Select {
      height: 40px;
      width: 100%;
    }
    ^ .label {
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
    }
    ^container {
      margin-bottom: 20px;
    }
    ^disclaimer {
      font-size: 16px;
      color: #525455;
      margin-top: 40px;
    }
    ^ .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
    }
    ^ .three-column {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-gap: 16px;
    }
    ^ .one-three-one-column {
      display: grid;
      grid-template-columns: 1fr 3fr 1fr;
      grid-gap: 16px;
    }
    ^ .one-two-column {
      display: grid;
      grid-template-columns: 1fr 2fr;
      grid-gap: 16px;
    }
    ^ .three-five-two-column {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-gap: 16px;
    }
    ^ .region-postal-code-column {
      display: grid;
      /* vertically align street number and region by giving same width */
      grid-template-columns: calc((100% - 32px) * 0.3) auto;
      grid-gap: 16px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'showValidation',
      documentation: 'Use this property if the value of validationTextVisible is situational.'
    },
    {
      class: 'Boolean',
      name: 'showDisclaimer',
      documentation: 'Displays PO boxes not allowed disclaimer if true.'
    },
    {
      class: 'Boolean',
      name: 'withoutCountrySelection',
      documentation: `If the value of this property is true, then hide country selection dropdown.`
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'customCountryDAO',
      documentation: 'Can be set if you want a filtered version of countryDAO.'
    },
    {
      class: 'String',
      name: 'regionLabel'
    },
    {
      class: 'String',
      name: 'defaultRegionLabel'
    },
    {
      class: 'String',
      name: 'postalCodeLabel'
    },
    {
      class: 'String',
      name: 'defaultPostalCodeLabel'
    },
    {
      name: 'addressConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.AddressConfig',
      expression: function(data$countryId) {
        var self = this;
        return this.AddressConfigDAO.find(data$countryId).then(result => {
          if ( ! result ) return self.AddressConfig.create({ streetNumber: 0, streetName: 1, suite: 2 });
          return result;
        });
      }
    },
    'order'
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'PO_DISCLAIMER', message: '* PO Boxes are not Allowed' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      // default translations
      self.defaultRegionLabel = self.regionLabel = this.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.REGION.label');
      self.defaultPostalCodeLabel = self.postalCodeLabel = this.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.label');
      
      // update translations
      this.data$.dot('countryId').sub(() => {
        const country = self.data.countryId.toLowerCase();
        self.regionLabel = self.translationService.getTranslation(foam.locale,`${country}.foam.nanos.auth.Address.REGION.label`, self.defaultRegionLabel);
        self.postalCodeLabel = self.translationService.getTranslation(foam.locale, `${country}.foam.nanos.auth.Address.POSTAL_CODE.label`, self.defaultPostalCodeLabel);
      });

      // Queried out American states from state/province list that are not supported by AscendantFX
      var choices = this.data$.dot('countryId').map(function(countryId) {
        return self.regionDAO.where(self.EQ(self.Region.COUNTRY_ID, countryId || ''));
      });

      var updateOrder = async () => {
        this.order = await this.addressConfig;
      };

      this.data$.dot('countryId').sub(updateOrder);

      updateOrder();

      this
        .addClass(this.myClass())
        .callIf( ! this.withoutCountrySelection, () => {
          this.start().addClass(this.myClass('container'))
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.COUNTRY_ID.clone().copyFrom({
                  view: {
                    class: 'foam.u2.view.ChoiceView',
                    placeholder: this.PLACE_HOLDER,
                    dao: this.customCountryDAO,
                    objToChoice: function(a) {
                      return [a.id, self.translationService.getTranslation(foam.locale, a.name, a.name)];
                    },
                    mode$: this.mode$
                  },
                  validationTextVisible: this.showValidation
                })
              })
            .end()
          .end();
        })
        .start().addClass(this.myClass('container'))
          .start().addClass('three-five-two-column')
            .start().addClass('label-input')
            .style({ 'order': this.order$.map(order => order && order.streetNumber ), 'grid-column-end': 'span 3' })
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.STREET_NUMBER.clone().copyFrom({
                  validationTextVisible: this.showValidation
                })
              })
            .end()
            .start().addClass('label-input')
            .style({ 'order': this.order$.map(order => order && order.streetName ), 'grid-column-end': 'span 6' })
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.STREET_NAME.clone().copyFrom({
                  validationTextVisible: this.showValidation
                })
              })
            .end()
            .start().addClass('label-input')
            .style({ 'order': this.order$.map(order => order && order.suite ), 'grid-column-end': 'span 3' })
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.SUITE.clone().copyFrom({
                  validationTextVisible: this.showValidation
                })
              })
            .end()
          .end()
        .end()
        .start().addClass(this.myClass('container'))
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.CITY.clone().copyFrom({
                validationTextVisible: this.showValidation
              })
            })
          .end()
        .end()
        .start().addClass(this.myClass('container'))
          .start().addClass('region-postal-code-column')
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.REGION_ID.clone().copyFrom({
                  view: {
                    class: 'foam.u2.view.ChoiceView',
                    placeholder: this.PLACE_HOLDER,
                    objToChoice: function(region) {
                      return [region.id, region.name];
                    },
                    dao$: choices,
                    mode$: this.mode$
                  },
                  label$: this.regionLabel$,
                  validationTextVisible: this.showValidation
                })
              })
            .end()
            .start().addClass('label-input')
              .tag(this.SectionedDetailPropertyView, {
                data$: this.data$,
                prop: this.Address.POSTAL_CODE.clone().copyFrom({
                  label$: this.postalCodeLabel$,
                  validationTextVisible: this.showValidation
                })
              })
            .end()
          .end()
        .end()
        .callIf( this.showDisclaimer, () => {
          this.start().addClass(this.myClass('container'))
            .addClass(this.myClass('disclaimer'))
            .add(this.PO_DISCLAIMER)
          .end();
        })
      .end();
    }
  ]
});
