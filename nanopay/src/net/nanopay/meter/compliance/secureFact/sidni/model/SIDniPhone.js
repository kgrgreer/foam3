foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniPhone',

  documentation: `The Phone object for SIDni`,

  properties: [
    {
      class: 'String',
      name: 'type',
      required: true,
      documentation: 'Type of phone number; must be Home, Mobile, or Work.',
      validateObj: function(type) {
        if ( ! (type === 'Home' || type === 'Mobile' || type === 'Work') ) {
          return 'Invalid phone number type';
        }
      }
    },
    {
      class: 'String',
      name: 'number',
      required: true,
      documentation: 'The phone number. 10 digit only, no dashes.',
      validateObj: function(number) {
        var regExp = /[0-9]{10}/;
        if ( ! regExp.match(number) ) {
          return 'Invalid phone number format';
        }
      }
    },
  ]
});
