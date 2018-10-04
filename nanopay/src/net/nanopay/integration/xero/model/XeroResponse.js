foam.CLASS({
  package: 'net.nanopay.integration.xero.model',
  name: 'XeroResponse',
  documentation: 'Allows the system to return a message from a Stub',
  properties: [
    {
      class: 'Boolean',
      name: 'result'
    },
    {
      class: 'String',
      name: 'reason'
    },
  ]
});
