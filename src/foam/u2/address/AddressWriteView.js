/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.address',
  name: 'AddressWriteView',
  extends: 'foam.u2.View',
  documentation: 'FOAM default address view, uses google places API when available. Supports both structed and unstructured addresses',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Region',
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit'
  ],

  imports: [
    'countryDAO',
    'regionDAO',
    'placeService?',
    'translationService'
  ],
  exports: [
    'data.countryId as currentCountry'
  ],
  css: `
    ^{
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    ^three-column {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-gap: 8px;
      align-items: start;
    }
  `,

  classes: [
    {
      name: 'AutocompleterAddressFields',
      extends: 'foam.u2.View',

      imports: ['placeService'],

      css: `
        ^two-column {
          display: grid;
          grid-template-columns: 3fr 1fr;
          grid-gap: 8px;
          align-items: start;
        }
      `,
      methods: [
        function render() {
          let self = this;
          this.start().addClass(this.myClass('two-column'))
          .start(this.data.ADDRESS1.__, {
            config:  {
              view: {
                class: 'foam.u2.address.AddressCompleterField',
                onSelect: async function(obj) {
                  let a = await self.placeService?.placeDetail(null, obj.placeId);
                  if ( ! a.result?.addressComponents )
                    self.__subContext__.notify('oops.....try again');
                  self.data = a.result.address.copyFrom({ structured: self.data.structured });
                }
              }
            } 
          })
            .style({ 'grid-column': self.data$.dot('structured').map(v => v ? 'span 1' :'span 2') })
          .end()
          .add(self.slot(function(data$structured) {
            if ( ! data$structured ) return this.E().hide();
            return this.E().style({ display: 'contents' })
            .start(self.data.SUITE.__)
            .end()
          }))
        .end();
        }
      ]
    },
    {
      name: 'StructuredAddressFields',
      extends: 'foam.u2.View',

      imports: ['addressConfigDAO'],

      requires: [
        'foam.nanos.auth.AddressConfig',
        'foam.u2.layout.Grid',
        'foam.u2.layout.GUnit'
      ],

      properties: ['order'],

      methods: [
        function render() {
          var self = this;
          var updateOrder = async () => {
            this.order = this.AddressConfig.create({ streetNumber: 0, streetName: 1, suite: 2 });
            this.order = await this.addressConfigDAO.find(this.data.countryId).then(result => {
              if ( ! result ) return this.AddressConfig.create({ streetNumber: 0, streetName: 1, suite: 2 });
              return result;
            });
          };
    
          this.onDetach(this.data$.dot('countryId').sub(updateOrder));
          updateOrder();

          this
            .add(self.slot(function(order) {
              if ( order )
                var arr = [self.data.STREET_NUMBER, self.data.STREET_NAME, self.data.SUITE].sort((a, b) => order[a.name] - order[b.name]);
              var a = self.Grid.create().addClass(self.myClass('grid'));
              const hasThreeColumns = arr.filter(el => el.visibility != 'HIDDEN').length == 3;
              for ( let prop of arr ) {
                a.start(self.GUnit, { columns: hasThreeColumns ? prop.gridColumns : 6 })
                  .tag(prop.__)
                .end();
              }
              return a;
            }));
        }
      ]
    },
    {
      name: 'UnstructuredAddressFields',
      extends: 'foam.u2.layout.Grid',

      requires: [
        'foam.u2.layout.Grid',
        'foam.u2.layout.GUnit'
      ],

      properties: ['data'],

      css:`
        ^two-column {
          align-items: start;
          gap: 8px;
        }
      `,

      methods: [
        function render() {
          this.SUPER();
          this
            .addClass(this.myClass('two-column'))
            .start(this.GUnit, { columns: this.data.ADDRESS1.gridColumns  }).tag(this.data.ADDRESS1.__).end()
            .start(this.GUnit, { columns: this.data.ADDRESS2.gridColumns }).tag(this.data.ADDRESS2.__).end();
        }
      ]
    }
  ],

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
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'data'
    },
    {
      class: 'Boolean',
      name: 'useAutocompleter'
    },
    {
      class: 'Enum',
      of: 'foam.u2.DisplayMode',
      name: 'countrySelectionVisibility',
      documentation: `Visibility Predicate for country selection`
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' }
  ],

  methods: [
    function init() {
      this.initAddress();
    },
    function render() {
      this.SUPER();
      var self = this;
      // default translations
      self.defaultRegionLabel = self.regionLabel = this.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.REGION.label', self.Address.REGION_ID.label);
      self.defaultPostalCodeLabel = self.postalCodeLabel = this.translationService.getTranslation(foam.locale, '*.foam.nanos.auth.Address.POSTAL_CODE.label', self.Address.POSTAL_CODE.label);

      function updateTranslations() {
        const country = self.data.countryId.toLowerCase();
        self.regionLabel = self.translationService.getTranslation(foam.locale,`${country}.foam.nanos.auth.Address.REGION.label`, self.defaultRegionLabel);
        self.postalCodeLabel = self.translationService.getTranslation(foam.locale, `${country}.foam.nanos.auth.Address.POSTAL_CODE.label`, self.defaultPostalCodeLabel);
      }
      // update translations
      this.data$.dot('countryId').sub(updateTranslations);
      updateTranslations();

      var choices = this.data$.dot('countryId').map(function(countryId) {
        return self.regionDAO.where(self.EQ(self.Region.COUNTRY_ID, countryId || ''));
      });

      this
        .addClass(this.myClass())
        .tag(this.data.COUNTRY_ID.__, {
          config: {
            view: {
              class: 'foam.u2.view.ChoiceView',
              placeholder: this.PLACE_HOLDER,
              dao: this.customCountryDAO,
              objToChoice: function(a) {
                return [a.id, a.name];
              },
              mode$: this.mode$
            },
            ...( this.countrySelectionVisibility && {visibility$: this.countrySelectionVisibility$})
          }
        })
        .call(this.placeTopFields, [self])
        .start(this.Grid).addClass(this.myClass('three-column'))
          .start(this.GUnit, { columns: this.data.CITY.gridColumns })
            .tag(this.data.CITY.__)
          .end()
          .start(this.GUnit, { columns: this.data.REGION_ID.gridColumns })
            .tag(this.data.REGION_ID.__, { 
              config: {
                view: {
                  class: 'foam.u2.view.ChoiceView',
                  placeholder: this.PLACE_HOLDER,
                  objToChoice: function(region) {
                    return [region.id, region.name];
                  },
                  dao$: choices
                },
                label$: this.regionLabel$
              }
            })
          .end()
          .start(this.GUnit, { columns: this.data.POSTAL_CODE.gridColumns })
            .tag(this.data.POSTAL_CODE.__, { config: { label$: this.postalCodeLabel$ }})
          .end()
        .end();
    },
    function placeTopFields(self) {
      if ( self.placeService && self.useAutocompleter ) {
        this.tag(this.AutocompleterAddressFields, { data$: self.data$ });
      } else if ( self.data.structured ) {
        this.tag(this.StructuredAddressFields, { data$: self.data$ });
      } else {
        this.tag(this.UnstructuredAddressFields, { data$: self.data$ });
      }
    },
    function fromProperty(prop) {
      this.useAutocompleter = prop.useAutocompleter;
    }
  ],
  listeners: [
    function initAddress() {
      // Address uses foam.pattern.Faceted pattern,
      // so the model has to be created to override existing model
      // Also this process should be repeated if the country changes
      this.data = this.Address.create(this.data);
      this.data$.dot('countryId').sub(foam.events.oneTime(this.initAddress));
    }
  ]
});
