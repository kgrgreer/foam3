foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityRevokingRequest', 
  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'userCapabilityJunctionDAO',
    'capabilityDAO'
  ],

  requires: [
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
  ],

  properties: [  
    {
      name: 'usersToRevokeFrom',
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
      name: 'account',
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
          .add('Select Account (or dont)')
          .add(self.ACCOUNT)
          .add('Add Users For Whom This Capability Will be Revoked From')
          .add(self.USERS_TO_REVOKE_FROM)
          .add(self.REVOKE)
        .end();
    },
    { name: 'revokeFromUser',
      documentation: `
      Revokes a capability from a user.
      If the capability selected is a globalLiquidCapability, remove the userCapabilityJunction
      Else if the capability selected is a accountBasedLiquidCapability, remove the chosen account from the 
      accountmap in the ucj.
        if the accountmap has no more accounts after the removal, remove the ucj
        else, update the data of the ucj with the new accountmap
      `,
      code: async function revokeFromUser(userId, capabilityId, account = null) {
        var isAccountBasedCapability = ( account != null );

        var ucj = await this.userCapabilityJunctionDAO.find( 
          this.AND(
            this.EQ(this.UserCapabilityJunction.SOURCE_ID, userId), 
            this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
        ));
        console.log(ucj);
        if ( ! ucj ) console.error("ucj not found");

        
        if ( isAccountBasedCapability ) {
          var accountmap = ucj.data;
          accountmap.removeAccount(account);
          if ( accountmap.accounts.size === 0 ) {
            await this.userCapabilityJunctionDAO.remove(this.__subContext__, ucj);
          } else {
            ucj.data = accountmap;
            console.log(accountmap.accounts);
            await this.userCapabilityJunctionDAO.put_(this.__subContext, ucj);
          }
        } else {
          await this.userCapabilityJunctionDAO.remove_(this.__subContext__, ucj);
        }
        
        console.log("done");
      }
    
    }
  ],
  
  actions: [
    {
      name: 'revoke',
      code: async function revoke() {
        var cap = await this.capabilityDAO.find(this.capability);
        var isAccountBasedCapability = this.AccountBasedLiquidCapability.isInstance(cap);

        if ( isAccountBasedCapability && ! this.account ) {
          console.error('Account must be provided for revoking of Account-Based Capabilities');
          return;
        }
        
        var account = isAccountBasedCapability ? this.account : null;
        this.usersToRevokeFrom.forEach((userId) => {
          this.revokeFromUser(userId, this.capability, account);
        });
      }
    },
  ]
});
