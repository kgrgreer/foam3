foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniDataSources',

  properties: [
    {
      class: 'String',
      name: 'verificationSource'
    },
    {
      class: 'String',
      name: 'type',
    },
    {
      class: 'String',
      name: 'reference'
    },
    {
      class: 'String',
      name: 'date',
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndDOB'
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndAddress',
    },
    {
      class: 'Boolean',
      name: 'verifiedNameAndAccount',
    },
    {
      class: 'String',
      name: 'creditFileAge'
    }
  ]
});
