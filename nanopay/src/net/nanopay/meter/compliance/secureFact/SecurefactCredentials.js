foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'SecurefactCredentials',

  axioms: [
    foam.pattern.Singleton.create()
  ],

  properties: [
    {
      class: 'String',
      name: 'sidniUrl',
      label: 'SIDni URL'
    },
    {
      class: 'String',
      name: 'sidniApiKey',
      label: 'SIDni API Key'
    },
    {
      class: 'String',
      name: 'levUrl',
      label: 'LEV URL'
    },
    {
      class: 'String',
      name: 'levApiKey',
      label: 'LEV API Key'
    }
  ]
});
