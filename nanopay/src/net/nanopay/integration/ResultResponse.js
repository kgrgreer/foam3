foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'ResultResponse',
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
