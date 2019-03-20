foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniName',

  documentation: `The name object for SIDni`,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      required: true
    },
    {
      class: 'String',
      name: 'middleName'
    },
    {
      class: 'String',
      name: 'lastName',
      required: true
    },
    {
      class: 'String',
      name: 'suffix',
      documentation: `Individual's name suffix`
    }
  ]
});
