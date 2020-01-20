foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityRequest', 

  implements: [
    'net.nanopay.liquidity.approvalRequest.ApprovableAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  imports: [
    'capabilityAccountTemplateDAO',
    // TODO: figure out why we can't import controllerMode
    // 'controllerMode'
  ],

  javaImports: [
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
  ],

  tableColumns: [
    'id',
    'requestType',
    'lifecycleState',
    'lastModified'
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
      javaType: 'java.util.List<Long>',
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
      class: 'Boolean',
      name: 'isUsingTemplate',
      value: false,
      visibilityExpression: function(requestType) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) {
          this.IS_USING_TEMPLATE.label = 'Assign to Multiple Accounts Using a Template';
          return foam.u2.Visibility.RW;
        }
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) {
          this.IS_USING_TEMPLATE.label = 'Revoke Multiple Accounts Using a Template';
          return foam.u2.Visibility.RW;
        }

        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      name: 'accountBasedCapability',
      of: 'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
      visibilityExpression: function(requestType) {
        if ( 
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ||
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
        ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      name: 'globalCapability',
      of: 'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
      visibilityExpression: function(requestType) {
        if ( 
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL ||
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_GLOBAL
        ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'capabilityAccountTemplateChoice',
      flags: ['js'],
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplate',
      label: 'Choose Capability Account Template',
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( 
            isUsingTemplate &&
            (
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ||
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
            )
          ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      },
      postSet: function(_, data) {
        this.capabilityAccountTemplateDAO.find(data).then((template) => {
          this.capabilityAccountTemplateMap = template.accounts;
        });
      }
    },
    {
      name: 'capabilityAccountTemplateMap',
      class: 'Map',
      javaType: 'java.util.Map<String, CapabilityAccountData>',
      label: 'Create New Template Or Customize Chosen Capability Account Template ', 
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( 
            isUsingTemplate &&
            (
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ||
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
            )
          ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      },
      view: function(_, x) {
        return {
          class: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplateMapView',
          isCapabilityAccountData: true
        };
      }
    },
    {
      class: 'Reference',
      name: 'accountToAssignTo',
      of : 'net.nanopay.account.Account',
      visibilityExpression: function(requestType, isUsingTemplate) {

        if ( ! isUsingTemplate && requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) {
          this.ACCOUNT_TO_ASSIGN_TO.label = 'Account To Assign To';
          return foam.u2.Visibility.RW;
        }
        if ( ! isUsingTemplate && requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) {
          this.ACCOUNT_TO_ASSIGN_TO.label = 'Account To Revoke From';
          return foam.u2.Visibility.RW;
        }

        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'approverLevel',
      class: 'Int',
      javaType: 'java.lang.Integer',
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL || 
          ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED && ! isUsingTemplate )
        ) 
          return foam.u2.Visibility.RW;
        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      label: 'Status',
      value: foam.nanos.auth.LifecycleState.ACTIVE,
      createMode: 'HIDDEN', // No point in showing as read-only during create since it'll always be 0
      updateMode: 'RO',
      readMode: 'RO'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      createMode: 'HIDDEN', 
      updateMode: 'RO',
      readMode: 'RO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback'
    }
  ],

  methods: [
    {
      name: 'getApprovableKey',
      type: 'String',
      javaCode: `
        String id = String.valueOf(getId());
        return id;
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function(){
        return `(Capability Request #${this.id}) ${this.requestType.label}`
      }
    }
  ]
});
