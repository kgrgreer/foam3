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
  name: 'UnstructuredAddressView',
  extends: 'foam.u2.View',
  documentation: 'Alternative view to StructuredAddressView, where address data is unstructured',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Region',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  imports: [
    'countryDAO',
    'regionDAO',
    'translationService'
  ],

  css: `
    ^ .one-two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'customCountryDAO',
      documentation: 'Can be set if you want a filtered version of countryDAO.',
      factory: function() {
        return this.countryDAO;
      }
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
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' }
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

      this
        .addClass(this.myClass())
        .start().addClass('one-two-column')
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.ADDRESS1.clone().copyFrom()
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.ADDRESS2.clone().copyFrom()
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.CITY.clone().copyFrom()
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.COUNTRY_ID.clone().copyFrom({
                view: {
                  class: 'foam.u2.view.ChoiceView',
                  placeholder: this.PLACE_HOLDER,
                  dao: this.customCountryDAO,
                  objToChoice: function(a) {
                    return [a.id, a.name];
                  },
                  mode$: this.mode$
                }
              })
            })
          .end()
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
                label$: this.regionLabel$
              })
            })
          .end()
          .start().addClass('label-input')
            .tag(this.SectionedDetailPropertyView, {
              data$: this.data$,
              prop: this.Address.POSTAL_CODE.clone().copyFrom({
                label$: this.postalCodeLabel$
              })
            })
          .end()
        .end();
    }
  ]
});
