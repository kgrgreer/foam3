foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'RemoveAccountBasedUCJIfAccountsEmpty',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',


  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.liquidity.crunch.AccountApproverMap',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            if ( ((AccountApproverMap) ucj.getData()).getAccounts().size() == 0 ) {
              DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
              ucjDAO.remove(ucj.getId());
            }
          }
        }, "remove ucj if all accounts have been revoked");
      `
    }
  ]
})
    