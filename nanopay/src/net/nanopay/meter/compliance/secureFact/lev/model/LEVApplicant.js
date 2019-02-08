foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev.model',
  name: 'LEVApplicant',

  properties: [
    {
      class: 'String',
      name: 'firtName',
      validateObj: function(firstName) {
        if ( firstName.length > 75 ) {
            return 'First name has a max length of 75.';
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      validateObj: function(lastName) {
        if ( lastName.length > 75 ) {
            return 'Last name has a max length of 75.';
        }
      }
    }
  ]
});
