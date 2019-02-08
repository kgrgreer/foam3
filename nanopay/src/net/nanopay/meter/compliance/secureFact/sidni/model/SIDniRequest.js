foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniRequest',

  documentation: `The request object for a SIDni validation request.`,

  javaImports: [
    'foam.lib.json.Outputter'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniCustomer',
      name: 'customer',
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniName',
      name: 'name',
      required: true,
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniAddress',
      name: 'address',
      required: true,
      documentation: 'Has to have current address. Max size of 2'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniPhone',
      name: 'phone',
    },
    {
      class: 'String',
      name: 'dateOfBirth',
      required: true,
      documentation: 'Must be YYYY-MM-DD format.',
      validateObj: function(dateOfBirth) {
        var regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
        if ( ! regex.match(dateOfBirth) ) {
          return 'Invalid date of birth format.';
        }
      }
    },
    {
      class: 'String',
      name: 'sin',
      documentation: 'Social insurance number. Must be 9 digits',
      validateObj: function(sinNumber) {
        if ( sinNumber.length > 9 ) {
          return 'Invalid SIN number.';
        }
      }
    }
  ],
  methods: [
    {
      name: 'toJSON',
      javaReturns: 'String',
      javaCode: `
        Outputter out = new Outputter();
        out.setOutputClassNames(false);
        return out.stringify(this);
      `
    },
  ]
});
