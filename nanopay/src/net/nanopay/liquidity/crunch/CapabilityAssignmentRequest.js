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
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability',
    'net.nanopay.liquidity.crunch.AccountTemplate',
    'net.nanopay.liquidity.crunch.AccountData',
  ],

  properties: [  
    {
      name: 'userIds',
      class: 'List',
      required: true
    },
    {
      name: 'accountTemplate',
      class: 'AccountTemplate',
    },
    {
      name: 'approverLevel',
      class: 'Int',
      javaType: 'java.lang.Integer'
    },
    {
      name: 'capability',
      class: 'LiquidCapability',
      required: true
    }
  ],

  methods: [
    {
      name: 'assignUserAccountBasedCapability',
      code: async function assignUserAccountBasedCapability(userId, capabilityId, accountTemplate) {
        if ( accountTemplate == null ) return;
        
        var ucj = await this.userCapabilityJunctionDAO.find_(this.__subContext__, 
          this.AND(
            this.EQ(this.UserCapabilityJunction.SOURCE_ID, userId), 
            this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
          ));
        
        // if ucj is not null, add new accounttemplate to old template of ucj
        if ( ucj != null ) {
          var oldTemplate = ucj.data;
          var newMap = accountTemplate.accounts;

          var keySetIterator = this.newMap.keys();
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
      name: 'submit',
      code: function submit() {
        var isAccountBasedCapability = this.AccountBasedLiquidCapability.isInstance(this.capability);
        if ( isAccountBasedCapability && ( ! accounts || account.length == 0 )) {
          console.err("account must must be supplied to assign account-based capability to user");
          return;
        }

        if ( isAccountBasedCapability ) {
          this.userIds.forEach((userId) => {
            assignUserAccountBasedCapability(userId, this.capability.id, this.accountTemplate);
          });
        } else {
          this.userIds.forEach((userId) => {
            assignUserGlobalCapability(userId, this.capability.id, this.approverLevel);
          });
        }

        
      }
    },
  ]
});

  