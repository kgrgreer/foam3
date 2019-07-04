foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'SecurefactRequest',

  properties: [
    {
      class: 'String',
      name: 'url',
      transient: true
    },
    {
      class: 'String',
      name: 'authKey',
      transient: true
    }
  ]
});
