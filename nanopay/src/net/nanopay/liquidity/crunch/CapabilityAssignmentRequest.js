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
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability'
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
      name: 'capabilityAccountTemplate',
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
      code: async function assignUserAccountBasedCapability(userId, capabilityId, capabilityAccountTemplate) {
        if ( capabilityAccountTemplate == null ) return;
        
        var ucj = await this.userCapabilityJunctionDAO.find(
          this.AND(
            this.EQ(this.UserCapabilityJunction.SOURCE_ID, userId), 
            this.EQ(this.UserCapabilityJunction.TARGET_ID, capabilityId)
          ));
          
        // todo ruby there should be a rule that calls mergeMaps if ucj is not null
        // or do this on front-end, whichever
        ucj = this.UserCapabilityJunction.create({
          sourceId: userId, 
          targetId: capabilityId,
          data: capabilityAccountTemplate
        });
        // }

        // (re)put ucj into dao
        await this.userCapabilityJunctionDAO.put_(this.__subContext__, ucj);
      }
    },
    {
      name: 'assignUserGlobalCapability',
      code: async function assignUserGlobalCapability(userId, capabilityId, approverLevel) {

        approverLevel = approverLevel < 1 ? 1 : approverLevel;
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

        if ( isAccountBasedCapability && ! this.capabilityAccountTemplate ) {
          console.err("account must must be supplied to assign account-based capability to user");
          return;
        }

        if ( isAccountBasedCapability ) {
          capabilityAccountTemplate = await this.capabilityAccountTemplateDAO.find(this.capabilityAccountTemplate);
          if ( ! capabilityAccountTemplate ) {
            console.err("capabilityAccountTemplate not found");
            return;
          }
          this.assignedUsers.forEach((user) => {
            this.assignUserAccountBasedCapability(user, this.capability, capabilityAccountTemplate);
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

  