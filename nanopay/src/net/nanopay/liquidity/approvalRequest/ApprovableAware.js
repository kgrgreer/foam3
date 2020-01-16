foam.INTERFACE({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'ApprovableAware',
  implements: [
    'foam.core.ContextAware',
    'foam.nanos.auth.LifecycleAware'
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String'
    }
  ]
});
