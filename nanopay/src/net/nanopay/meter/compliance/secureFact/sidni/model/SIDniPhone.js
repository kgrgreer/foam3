foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniPhone',

  documentation: `The Phone object for SIDni`,

  properties: [
    {
      class: 'String',
      name: 'type',
      required: true,
      documentation: 'Type of phone number; must be Home, Mobile, or Work.'
    },
    {
      class: 'String',
      name: 'number',
      required: true,
      documentation: 'The phone number. 10 digit only, no dashes.'
    },
  ]
});
