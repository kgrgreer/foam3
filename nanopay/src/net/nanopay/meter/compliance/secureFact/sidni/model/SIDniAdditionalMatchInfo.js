foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniAdditionalMatchInfo',

  properties: [
    {
      class: 'String',
      name: 'source',
      documentation: 'Name of data source providing additonal match information',
    },
    {
      class: 'String',
      name: 'fieldName',
    },
    {
      class: 'String',
      name: 'fieldValue',
    },
    {
      class: 'String',
      name: 'description',
    },
  ]
});
