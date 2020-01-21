foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityRequest',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
    'net.nanopay.liquidity.approvalRequest.ApprovableAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  imports: [
    'capabilityAccountTemplateDAO',
    // TODO: figure out why we can't import controllerMode
    // 'controllerMode'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.Map',
    'java.util.Set',
    'net.nanopay.liquidity.crunch.LiquidCapability',
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
      class: 'Reference',
      name: 'accountBasedCapability',
      label: 'Transactional Role Template',
      of: 'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
      visibilityExpression: function(requestType) {
        if ( 
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED
          // || requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
        ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      },
      validateObj: function(requestType, accountBasedCapability) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED &&
             ! accountBasedCapability
           )
          return 'Please select a Transactional Role Template';
      }
    },
    {
      class: 'Reference',
      name: 'globalCapability',
      label: 'Administrative Role Template',
      of: 'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
      visibilityExpression: function(requestType) {
        if ( 
          requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL
          // || requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_GLOBAL
        ) {
          return foam.u2.Visibility.RW;
        }
        return foam.u2.Visibility.HIDDEN;
      },
      validateObj: function(requestType, globalCapability) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL &&
             ! globalCapability
           )
          return 'Please select an Administrative Role Template';
      }
    },
    {
      name: 'users',
      class: 'List',
      javaType: 'java.util.List<Long>',
      factory: () => [],
      view: (_, X) => {
        return {
          class: 'foam.u2.view.ReferenceArrayView',
          daoKey: 'userDAO',
          dao: X.userDAO.where(X.data.EQ(foam.nanos.auth.User.GROUP, 'liquidBasic')).orderBy(foam.nanos.auth.User.LEGAL_NAME)
        };
      },
      validateObj: function(users) {
        if ( users.length == 0 || users.some( u => ! u ) ) {
          return 'Valid selection required';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'isUsingTemplate',
      visibilityExpression: function(requestType) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) {
          this.IS_USING_TEMPLATE.label = 'Assign to Multiple Accounts Using an Account Group';
          return foam.u2.Visibility.RW;
        }
        // if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) {
        //   this.IS_USING_TEMPLATE.label = 'Revoke Multiple Accounts Using an Account Group';
        //   return foam.u2.Visibility.RW;
        // }

        return foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'capabilityAccountTemplateChoice',
      flags: ['js'],
      class: 'Reference',
      of: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplate',
      label: 'Choose Account Group',
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( 
            isUsingTemplate &&
            (
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED
              // || requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
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
      },
      validateObj: function(isUsingTemplate, requestType, capabilityAccountTemplateChoice, capabilityAccountTemplateMap) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED &&
             isUsingTemplate &&
             ( ! capabilityAccountTemplateChoice && Object.keys(capabilityAccountTemplateMap).length == 0 )
           )
          return 'Please select an Account Group, or create a new Account Group Template';
      }
    },
    {
      name: 'capabilityAccountTemplateMap',
      class: 'Map',
      javaType: 'java.util.Map<String, CapabilityAccountData>',
      label: 'Create New Template Or Customize Chosen Account Group ', 
      visibilityExpression: function(requestType, isUsingTemplate) {
        if ( 
            isUsingTemplate &&
            (
              requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED
              // || requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED
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
      },
      validateObj: function(isUsingTemplate, requestType, capabilityAccountTemplateMap, capabilityAccountTemplateChoice) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED &&
             isUsingTemplate && 
             ( capabilityAccountTemplateChoice && Object.keys(capabilityAccountTemplateMap).length == 0 )
           )
          return 'Please enter a valid Account Group';
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
        // if ( ! isUsingTemplate && requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) {
        //   this.ACCOUNT_TO_ASSIGN_TO.label = 'Account To Revoke From';
        //   return foam.u2.Visibility.RW;
        // }

        return foam.u2.Visibility.HIDDEN;
      },
      validateObj: function(isUsingTemplate, requestType, accountToAssignTo) {
        if (
             requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED &&
             ! isUsingTemplate &&
             ! accountToAssignTo
           )
          return 'Please select an Account';
      }
    },
    {
      name: 'approverLevel',
      label: 'Transaction Authorization Level (if applicable)',
      class: 'Int',
      min: 1, 
      max: 2,
      value: 1,
      preSet: function(o, n) {
        if ( n < 1 || n > 2 ) {
          if ( n < 1 ) return 1;
          if ( n > 2 ) return 2;
        }
        return n;
      },
      javaType: 'java.lang.Integer',
      validateObj: function(approverLevel) {
        if ( approverLevel < this.APPROVER_LEVEL.min || approverLevel > this.APPROVER_LEVEL.max ) {
          return this.approverLevelRangeError;
        }
      },
      visibilityExpression: function(requestType) {
        if ( requestType == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) {
          return foam.u2.Visibility.RW;
        }
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
      name: 'userFeedback',
      storageTransient: true,
      visibility: foam.u2.Visibility.HIDDEN
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
    },
    {
      name: 'validate',
      javaCode: `
        if ( getRequestType() == net.nanopay.liquidity.crunch.CapabilityRequestOperations.ASSIGN_GLOBAL ) return;

        Map<String, CapabilityAccountData> map = getCapabilityAccountTemplateMap();
        if ( map == null || map.size() == 0 ) 
          throw new IllegalStateException("At least one account must be provided in the Account Group Map");
        
        DAO dao = (DAO) x.get("localAccountDAO");
        Set<String> keySet = map.keySet();
        for ( String key : keySet ) {
          if ( dao.find(Long.parseLong(key)) == null ) 
            throw new IllegalStateException("One or more entries of this Account Group Map contains an invalid value for account");
        }
      `
    }
  ]
});
