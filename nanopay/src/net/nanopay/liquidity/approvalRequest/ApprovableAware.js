foam.INTERFACE({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'ApprovableAware',
  implements: [
    'foam.nanos.auth.LifecycleAware'
  ],

  javaImports: [
    'foam.core.X'
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String'
    }
  ]
});
