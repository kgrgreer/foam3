foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AddAccountToUserCapabilityJunctionOnCreate',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',


  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.crunch.*',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Map',
    'java.util.Set',
    'java.util.HashSet'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            Account account = (Account) obj;
            Long accountId = account.getId();

            // get all ucjs where it is account-based
            DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
            
            // todo ruby faster to make a predicate instead?
            List<UserCapabilityJunction> ucjs = ((ArraySink) ucjDAO.select(new ArraySink())).getArray();

            for ( UserCapabilityJunction ucj : ucjs ) {
              if ( ! ( ucj.getData() instanceof AccountApproverMap ) ) continue;
              AccountApproverMap map = (AccountApproverMap) ucj.getData();
              Long parent = map.impliesChildAccount(x, accountId);
              if ( parent > 0 ) {
                CapabilityAccountData data = map.getAccounts().get(String.valueOf(parent));
                map.addAccount(accountId, data);
                ucj.setData(map);
                ucjDAO.put(ucj);
              }
            }
          }
        }, "Add account to ucj data on account create");
      `
    }
  ]
})
    