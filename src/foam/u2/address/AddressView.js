/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.address',
  name: 'AddressView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'ModeAlt Address View, suitable for almost all address propery displays',

  requires: [
    'foam.nanos.auth.Country',
    'foam.u2.address.AddressWriteView'
  ],

  imports: [
    'countryDAO'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'useAutocompleter'
    },
    {
      class: 'Enum',
      of: 'foam.u2.DisplayMode',
      name: 'countrySelectionVisibility',
      documentation: `Visibility Predicate for country selection`,
      expression: function(data) {
        return data?.COUNTRY_ID.visibility ?? 'RW';
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'customCountryDAO',
      documentation: 'Can be set if you want a filtered version of countryDAO.',
      factory: function() {
        return this.countryDAO.orderBy(this.Country.NAME);
      }
    }
  ],

  methods: [
    function render() {
      let self = this;
      this.SUPER();

      this.add(this.slot(function(mode) {
        switch ( mode ) {
          case self.DisplayMode.RW:
          case self.DisplayMode.DISABLED:
            return this.E().tag(self.AddressWriteView, {
              data$: self.data$,  
              customCountryDAO$: self.customCountryDAO$,
              useAutocompleter$: self.useAutocompleter$,
              countrySelectionVisibility$: self.countrySelectionVisibility$
            })
          case self.DisplayMode.RO:
            return this.E().startContext({data: self.data$ }).tag((self.data ?? foam.nanos.auth.Address).SUMMARY.__).endContext();
          case self.DisplayMode.HIDDEN:
            break;
          default:
            console.warn('Unrecognized mode: ' + mode);
        }
      }));
      
    }
  ]
});
