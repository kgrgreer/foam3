foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniDataSources',

  properties: [
    {
      class: 'String',
      name: 'verificationSource'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'reference'
    },
    {
      class: 'String',
      name: 'date'
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndDOB'
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndAddress'
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndAccount'
    },
    {
      class: 'String',
      name: 'creditFileAge'
    }
  ]
});
