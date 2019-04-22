foam.CLASS({
  package: 'net.nanopay.account',
  name: 'NoChildrenRule',

  documentation: `Validator that checks if account has any children which were not deleted.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.DigitalAccount',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof DigitalAccount ) {
          Count count = new Count();
          DigitalAccount digitalAccount = (DigitalAccount) obj;
          count = (Count) ((DAO) x.get("accountDAO"))
            .where(
              AND(
                EQ(DigitalAccount.PARENT, digitalAccount.getId()),
                EQ(DigitalAccount.ENABLED, true),
                EQ(DigitalAccount.DELETED, false)
              )
            )
            .limit(1)
            .select(count);

          if ( count.getValue() > 0 )
            throw new RuntimeException("Cannot delete this account as it has children accounts");
        }
      `
    }
  ]
});
