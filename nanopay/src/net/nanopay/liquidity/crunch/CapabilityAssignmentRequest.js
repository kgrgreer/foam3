foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAssignmentRequest', 
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'userCapabilityJunctionDAO',
    'capabilityDAO',
    'userDAO',
    'capabilityAccountTemplateDAO'
  ],

  requires: [
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
    }
  ],

  // methods: [
  //   function initE() {
  //     this.SUPER();
  //     var self = this;

  //     this
  //       .start('h1').add('Capability Assignment').end()
  //       .start('h2')
  //         .add('Select Capability')
  //         .add(self.CAPABILITY)
  //         .add('Select Account Template or Approver Level')
  //         .add(self.ACCOUNT_TEMPLATE)
  //         .add(self.APPROVER_LEVEL)
  //         .add('Add Users To Be Assigned This Capability')
  //         .add(self.USERS)
  //         .add(self.ASSIGN)
  //       .end()
  //       .start('h1').add('Capability Revoking').end()
  //       .start('h2')
  //         .add('Select Account (or dont)')
  //         .add(self.ACCOUNT)
  //         .add(self.REVOKE)
  //       .end();
  //   },
  //   {
  //     name: 'assignUserAccountBasedCapability',
  //     code: async function assignUserAccountBasedCapability(userId, capabilityId, capabilityAccountTemplate) {
  //       if ( capabilityAccountTemplate == null ) return;
        
  //       var ucj = await this.userCapabilityJunctionDAO.find(
  //         this.AND(
  //           this.EQ(this.UserCapabilityJunction.SOURCE_ID, userId), 
  //           this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
  //         ));
          
  //       // todo ruby there should be a rule that calls mergeMaps if ucj is not null
  //       // or do this on front-end, whichever
  //       ucj = this.UserCapabilityJunction.create({
  //         sourceId: userId, 
  //         targetId: capabilityId,
  //         data: capabilityAccountTemplate
  //       });
  //       // }

  //       // (re)put ucj into dao
  //       await this.userCapabilityJunctionDAO.put_(this.__subContext__, ucj);
  //     }
  //   },
  //   {
  //     name: 'assignUserGlobalCapability',
  //     code: async function assignUserGlobalCapability(userId, capabilityId, approverLevel) {

  //       approverLevel = approverLevel < 1 ? 1 : approverLevel;
  //       var approverLevelObj = this.ApproverLevel.create({ approverLevel: approverLevel });

  //       var ucj = this.UserCapabilityJunction.create({
  //         sourceId: userId,
  //         targetId: capabilityId,
  //         data: approverLevelObj
  //       })
  //       await this.userCapabilityJunctionDAO.put_(this.__subContext__, ucj);
  //     }
  //   },
  //   { name: 'revokeFromUser',
  //     documentation: `
  //     Revokes a capability from a user.
  //     If the capability selected is a globalLiquidCapability, remove the userCapabilityJunction
  //     Else if the capability selected is a accountBasedLiquidCapability, remove the chosen account from the 
  //     accountmap in the ucj.
  //       if the accountmap has no more accounts after the removal, remove the ucj
  //       else, update the data of the ucj with the new accountmap
  //     `,
  //     code: async function revokeFromUser(userId, capabilityId, account = null) {
  //       var isAccountBasedCapability = ( account != null );

  //       var ucj = await this.userCapabilityJunctionDAO.find( 
  //         this.AND(
  //           this.EQ(this.UserCapabilityJunction.SOURCE_ID, userId), 
  //           this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
  //       ));
  //       console.log(ucj);
  //       if ( ! ucj ) console.error("ucj not found");

        
  //       if ( isAccountBasedCapability ) {
  //         var accountmap = ucj.data;
  //         accountmap.removeAccount(account);
  //         if ( accountmap.accounts.size === 0 ) {
  //           await this.userCapabilityJunctionDAO.remove(this.__subContext__, ucj);
  //         } else {
  //           ucj.data = accountmap;
  //           console.log(accountmap.accounts);
  //           await this.userCapabilityJunctionDAO.put_(this.__subContext, ucj);
  //         }
  //       } else {
  //         await this.userCapabilityJunctionDAO.remove_(this.__subContext__, ucj);
  //       }
        
  //       console.log("done");
  //     }
    
  //   }
  // ],
  
  // actions: [
  //   {
  //     name: 'assign',
  //     code: async function assign() {
  //       this.isRevoke = false;
  //       var cap = await this.capabilityDAO.find(this.capability);
  //       var isAccountBasedCapability = this.AccountBasedLiquidCapability.isInstance(cap);

  //       if ( isAccountBasedCapability && ! this.capabilityAccountTemplate ) {
  //         console.err("account must must be supplied to assign account-based capability to user");
  //         return;
  //       }

  //       if ( isAccountBasedCapability ) {
  //         capabilityAccountTemplate = await this.capabilityAccountTemplateDAO.find(this.capabilityAccountTemplate);
  //         if ( ! capabilityAccountTemplate ) {
  //           console.err("capabilityAccountTemplate not found");
  //           return;
  //         }
  //         this.users.forEach((user) => {
  //           this.assignUserAccountBasedCapability(user, this.capability, capabilityAccountTemplate);
  //         });
  //       } else {
  //         this.users.forEach((user) => {
  //           this.assignUserGlobalCapability(user, this.capability, this.approverLevel);
  //         });
  //       }

  //       console.log("done");
  //     }
  //   },
  //   {
  //     name: 'revoke',
  //     code: async function revoke() {
  //       this.isRevoke = true;
  //       var cap = await this.capabilityDAO.find(this.capability);
  //       var isAccountBasedCapability = this.AccountBasedLiquidCapability.isInstance(cap);

  //       if ( isAccountBasedCapability && ! this.account ) {
  //         console.error('Account must be provided for revoking of Account-Based Capabilities');
  //         return;
  //       }
        
  //       var account = isAccountBasedCapability ? this.account : null;
  //       this.usersToRevokeFrom.forEach((userId) => {
  //         this.revokeFromUser(userId, this.capability, account);
  //       });
  //       console.log("done");
  //     }
  //   },
  // ]
});