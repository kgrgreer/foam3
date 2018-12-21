foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PadAccount',

  documentation: 'Counter for times a specific Bank account has been added.',

  properties: [
    {
      class: 'String',
      name: 'combined',
      required: true
    },
    {
      name: 'count',
      required: true
    }
  ]
});
