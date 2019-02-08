foam.CLASS({
package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
name: 'SIDniAddress',

documentation: `The Phone object for SIDni`,

properties: [
  {
    class: 'String',
    name: 'addressType',
    required: true,
    documentation: 'Type of address, Current or Former',
    validateObj: function(addressType) {
    if ( ! (addressType === 'Current' || addressType === 'Former') ) {
      return 'Invalid address type.';
    }
   }
  },
  {
    class: 'String',
    name: 'addressLine',
    required: true,
    documentation: `Individual's street address. example: 1531 King Street`,
    validateObj: function(addressLine) {
      if ( addressLine.length > 100 ) {
        return 'Address length cannot be greater than 100 characters';
      }
    }
  },
  {
    class: 'String',
    name: 'city',
    required: true,
    validateObj: function(city) {
      if ( city.length > 50 ) {
        return 'City length cannot be greater than 50 characters';
      }
    }
  },
  {
    class: 'String',
    name: 'province',
    required: true,
    validateObj: function(province) {
    if ( ('ON', 'QC', 'AB', 'BC', 'SK', 'MB', 'NB', 'NS', 'NL', 'PE', 'YT', 'NT', 'NU').indexOf(province) > -1 ) {
        return;
      }
      return 'Invalid Province.';
    }
  },
  {
    class: 'String',
    name: 'postalCode',
    required: true,
    validateObj: function(postalCode) {
    var regex = /([A-Z][0-9]){3}/;
    if ( ! regex.match(postalCode) ) {
      return 'Invalid postal code';
    }
    }
  },
  {
    class: 'String',
    name: 'country',
    documentation: 'Only CA is supported right now',
    factory: function() {
      return 'CA';
    }
  }
  ]
});
