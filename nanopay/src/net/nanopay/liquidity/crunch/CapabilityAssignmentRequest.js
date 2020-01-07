foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAssignmentRequest', 

  implements: [
    'net.nanopay.liquidity.approvalRequest.ApprovableAware'
  ],

  javaImports: [
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
  ],

  properties: [  
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    {
      name: 'requestType',
      javaType: 'net.nanopay.liquidity.crunch.CapabilityRequestOperations',
      class: 'Enum',
      of: 'net.nanopay.liquidity.crunch.CapabilityRequestOperations'
    },
    {
      name: 'users',
      class: 'List',
      of: 'foam.nanos.auth.User',
      javaType: 'java.util.List<foam.nanos.auth.User>',
      factory: function () {
        return [];
      },
      view: () => {
        return {
          class: 'foam.u2.view.ReferenceArrayView',
          daoKey: 'userDAO'
        };
      }
    },
    {
      name: 'capability',
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.crunch.LiquidCapability',
      javaType: 'net.nanopay.liquidity.crunch.LiquidCapability',
      view: {
        class: 'foam.u2.view.ReferenceView',
        placeholder: '--'
      },
    },
    {
      name: 'capabilityAccountTemplate',
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplate',
      javaType: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplate',
      visibilityExpression: function(requestType) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) return foam.u2.Visibility.RW;
        return foam.u2.Visibility.HIDDEN;
      },
      view: {
        class: 'foam.u2.view.ReferenceView',
        placeholder: '--'
      },
    },
    {
      name: 'account',
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      javaType: 'net.nanopay.account.Account',
      visibilityExpression: function(requestType) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) return foam.u2.Visibility.RW;
        return foam.u2.Visibility.HIDDEN;
      },
      view: {
        class: 'foam.u2.view.ReferenceView',
        placeholder: '--'
      },
    },
    {
      name: 'approverLevel',
      class: 'Int',
      javaType: 'java.lang.Integer',
      visibilityExpression: function(requestType) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL ) return foam.u2.Visibility.RW;
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      visibility: 'RO'
    },
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String',
      javaCode: `
        String id = String.valueOf(getId());
        return id;
      `
    }
  ]
});