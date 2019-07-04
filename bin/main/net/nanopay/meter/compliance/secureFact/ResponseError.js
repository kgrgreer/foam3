foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'ResponseError',

  properties: [
    {
      class: 'String',
      name: 'field'
    },
    {
      class: 'String',
      name: 'error'
    },
    {
      class: 'String',
      name: 'message'
    }
  ]
});
