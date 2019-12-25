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
      name: 'capability',
      class: 'LiquidCapability',
      required: true
    }
  ],

  methods: [
    {
      name: 'assignUser',
      code: async function assignUser(userId, capabilityId, accountTemplate = null) {
        var ucj = this.UserCapabilityJunction.create({
          sourceId: userId,
          targetId: capabilityId,
          data: accountTemplate
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
        accountTemplate = isAccountBasedCapability ? this.accountTemplate : null;

        this.userIds.forEach((userId) => {
          assignUser(userId, this.capability.id, accountTemplate);
        });
      }
    },
  ]
});

  