/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityRevokingRequest', 
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'net.nanopay.liquidity.crunch.AccountTemplate',
  ],

  properties: [  
    {
      name: 'userIds',
      class: 'List',
      required: true
    },
    {
      name: 'account',
      class: 'Reference',
      of: 'net.nanopay.account.Account'
    },
    {
      name: 'cascadedRemove',
      class: 'Boolean',
      // show if : capability instanceof accountbasedliquidcapability
    },
    {
      name: 'capability',
      class: 'LiquidCapability',
      required: true
    }
  ],

  methods: [
    { name: 'revokeFromUser',
      documentation: `
      Revokes a capability from a user.
      If the capability selected is a globalLiquidCapability, remove the userCapabilityJunction
      Else if the capability selected is a accountBasedLiquidCapability, remove the chosen account from the 
      accounttemplate in the ucj.
        if the accounttemplate has no more accounts after the removal, remove the ucj
        else, update the data of the ucj with the new accounttemplate
      `,
      code: async function revokeFromUser(userId, capabilityId, account = null, cascadedRemove = true) {
        var isAccountBasedCapability = ( account != null );

        await this.userCapabilityJunctionDAO.find_(this.__subContext__, 
          this.AND(
            this.EQ(this.UserCapabilityJunction.SOURCE_ID, userId), 
            this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
        )).then((ucj) => {
          if ( isAccountBasedCapability ) {
            var accounttemplate = ucj.data;
            accounttemplate = accounttemplate.removeAccount(this.__subContext__, account, cascadedRemove);
            if ( accounttemplate.accounts.size === 0 ) {
              this.userCapabilityJunctionDAO.remove_(this.__subContext__, ucj.id);
            } else {
              ucj.data = accounttemplate;
              this.userCapabilityJunctionDAO.put_(this.__subContext, ucj);
            }
          } else {
            this.userCapabilityJunctionDAO.remove_(this.__subContext__, ucj.id);
          }
        }).catch((err) => {
          console.error(err);
        });
      }
    
    }
  ],
  
  actions: [
    {
      name: 'submit',
      code: function submit() {
        var isAccountBasedCapability = this.AccountBasedLiquidCapability.isInstance(this.capability);
        if ( isAccountBasedCapability && ! accounts ) {
          console.error('Account must be provided for revoking of Account-Based Capabilities');
          return;
        }
        
        var account = isAccountBasedCapability ? this.account : null;
        this.userIds.forEach((userId) => {
          revokeFromUser(userId, this.capability.id, account, this.cascadedRemove);
        });
      }
    },
  ]
});
