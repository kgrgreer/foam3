foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AddressModel',

  documentation: 'model for the Flinks address mode',

  properties: [
    {
      class: 'String',
      name: 'CivicAddress',
      validateObj: function(addressLine) {
        if ( ! addressLine || addressLine > 70 ) {
          return this.AddressError;
        }
      }
    },
    {
      class: 'String',
      name: 'City',
      validateObj: function(city) {
        if ( ! city || city.length > 35 ) {
          return this.AddressCityError;
        }
      }
    },
    {
      class: 'String',
      name: 'Province',
      validateObj: function(province) {
        if ( ! province || province.name.length > 35 ) {
          return this.AddressProvinceError;
        }
      }
    },
    {
      class: 'String',
      name: 'PostalCode',
      validateObj: function(postalCode) {
        var postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

        if ( ! postalCodeRegex.test(postalCode) ) {
          return this.AddressPostalCodeError;
        }
      }
    },
    {
      class: 'String',
      name: 'POBox'
    }
  ],

  messages: [
    { name: 'AddressError', message: 'Street address is invalid' },
    { name: 'AddressCityError', message: 'City name is invalid' },
    { name: 'AddressProvinceError', message: 'Invalid province option' },
    { name: 'AddressPostalCodeError', message: 'Invalid postal code' }
  ]
});