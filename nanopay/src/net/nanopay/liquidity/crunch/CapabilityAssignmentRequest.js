/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAssignmentRequest', 
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'userCapabilityJunctionDAO',
    'capabilityDAO',
    'userDAO',
    'accountTemplateDAO'
  ],

  requires: [
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
    // 'net.nanopay.liquidity.crunch.AccountTemplate',
    'net.nanopay.liquidity.crunch.AccountData',
  ],

  properties: [  
    {
      name: 'assignedUsers',
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
      name: 'accountTemplate',
      view: function(_, x) {
        return {  
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Account Template to use as data for this Capability assignment',
              dao: x.accountTemplateDAO
            }
          ]
        };
      }
    },
    {
      name: 'approverLevel',
      class: 'Int',
      javaType: 'java.lang.Integer'
    },
    {
      name: 'capability',
      required: true,
      view: function(_, x) {
        return {  
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Capability to be Assigned',
              dao: x.capabilityDAO
            }
          ]
        };
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .start('h1')
          .add('Select Capability')
          .add(self.CAPABILITY)
          .add('Select Account Template or Approver Level')
          .add(self.ACCOUNT_TEMPLATE)
          .add(self.APPROVER_LEVEL)
          .add('Add Users To Be Assigned This Capability')
          .add(self.ASSIGNED_USERS)
          .add(self.ASSIGN)
        .end();
    },
    {
      name: 'assignUserAccountBasedCapability',
      code: async function assignUserAccountBasedCapability(userId, capabilityId, accountTemplate) {
        if ( accountTemplate == null ) return;
        
        var ucj = await this.userCapabilityJunctionDAO.find(
          this.AND(
            this.EQ(this.UserCapabilityJunction.SOURCE_ID, userId), 
            this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
          ));
        
        // if ucj is not null, add new accounttemplate to old template of ucj
        if ( ucj != null ) {
          var oldTemplate = ucj.data;
          console.log(accountTemplate, accountTemplate.accounts);
          var newMap = accountTemplate.accounts;

          var keySetIterator = newMap.keys();
          var newAccountToAdd = keySetIterator.next().value;
          while ( newAccountToAdd ) {
            oldTemplate.addAccount(newAccountToAdd, newMap.get(newAccountToAdd));
            newAccountToAdd = keySetIterator.next().value;
          }

          ucj.data = oldTemplate;
        } else { // else make a new ucj
          ucj = this.UserCapabilityJunction.create({
            sourceId: userId, 
            targetId: capabilityId,
            data: accountTemplate
          })
        }

        // (re)put ucj into dao
        await this.userCapabilityJunctionDAO.put_(this.__subContext__, ucj);
      }
    },
    {
      name: 'assignUserGlobalCapability',
      code: async function assignUserGlobalCapability(userId, capabilityId, approverLevel = 1) {

        var approverLevelObj = this.ApproverLevel.create({ approverLevel: approverLevel });

        var ucj = this.UserCapabilityJunction.create({
          sourceId: userId,
          targetId: capabilityId,
          data: approverLevelObj
        })
        await this.userCapabilityJunctionDAO.put_(this.__subContext__, ucj);
      }
    },
  ],
  
  actions: [
    {
      name: 'assign',
      code: async function assign() {
        var cap = await this.capabilityDAO.find(this.capability);
        var isAccountBasedCapability = this.AccountBasedLiquidCapability.isInstance(cap);

        if ( isAccountBasedCapability && ! this.accountTemplate ) {
          console.err("account must must be supplied to assign account-based capability to user");
          return;
        }

        console.log(this.assignedUsers, this.accountTemplate, this.approverLevel, this.capability);

        if ( isAccountBasedCapability ) {
          accountTemplate = await this.accountTemplateDAO.find(this.accountTemplate);
          if ( ! accountTemplate ) {
            console.err("accountTemplate not found");
            return;
          }
          this.assignedUsers.forEach((user) => {
            this.assignUserAccountBasedCapability(user, this.capability, accountTemplate);
          });
        } else {
          this.assignedUsers.forEach((user) => {
            this.assignUserGlobalCapability(user, this.capability, this.approverLevel);
          });
        }

        console.log("done");
      }
    },
  ]
});

  