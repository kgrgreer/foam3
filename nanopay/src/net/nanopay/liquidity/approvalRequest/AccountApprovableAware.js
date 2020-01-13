foam.INTERFACE({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountApprovableAware',
  implements: [
    'net.nanopay.liquidity.approvalRequest.ApprovableAware'
  ],

  javaImports: [
    'foam.core.X'
  ],

  methods: [
    {
      name: 'getOutgoingAccountCreate',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ]
    },
    {
      name: 'getOutgoingAccountRead',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ]
    },
    {
      name: 'getOutgoingAccountUpdate',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ]
    },
    {
      name: 'getOutgoingAccountDelete',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ]
    }
  ]
});
