foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAssignmentRequest', 

  implements: [
    'net.nanopay.liquidity.approvalRequest.ApprovableAware'
  ],

  imports: [
    'userCapabilityJunctionDAO',
    'capabilityDAO',
    'userDAO',
    'capabilityAccountTemplateDAO'
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
      required: true,
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
      required: true,
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.crunch.Capability',
      javaType: 'net.nanopay.liquidity.crunch.LiquidCapability',
      view: function(_, x) {
        return {  
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Capability to be Assigned/Revoked',
              dao: x.capabilityDAO
            }
          ]
        };
      }
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
      view: function(_, x) {
        return {  
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Account Template to use as data for this Capability assignment',
              dao: x.capabilityAccountTemplateDAO
            }
          ]
        };
      }
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
      view: function(_, x) {
        return {  
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Account for which this capability should be revoked from',
              dao: x.accountDAO
            }
          ]
        };
      }
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