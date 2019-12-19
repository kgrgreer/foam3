foam.INTERFACE({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'ApprovableInterface',

  javaImports: [
    'foam.core.X'
  ],

  methods: [
    {
      name: 'getKey',
      type: 'String'
    },
    {
      name: 'getOutgoingAccount',
      type: 'Long',
      args: [
        {
          type: 'X',
          name: 'x',
        }
      ]
    }
  ]
});
