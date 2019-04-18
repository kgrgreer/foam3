foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DuplicateDigitalAccountRule',

  documentation: `Validator that checks if a previous account
    With same name, description, parent and currency exists.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.DigitalAccount'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

      if ( obj instanceof DigitalAccount )
        if ( oldObj == null ) {
          Count count = new Count();
          DigitalAccount digitalAccount = (DigitalAccount) obj;
          count = (Count) ((DAO) x.get("accountDAO"))
            .where(
              AND(
                INSTANCE_OF(DigitalAccount.class),
                EQ(DigitalAccount.ENABLED, true),
                EQ(DigitalAccount.NAME, digitalAccount.getName()),
                EQ(DigitalAccount.DENOMINATION, digitalAccount.getDenomination()),
                HAS(DigitalAccount.PARENT),
                EQ(DigitalAccount.PARENT, digitalAccount.getParent()),
                EQ(DigitalAccount.DESC, digitalAccount.getDesc())
              )
            )
            .limit(1)
            .select(count);
          if ( count.getValue() > 0 ) {
            throw new  RuntimeException("You cannot create this account because it is a duplicate of another");
          }
        }
      `

    }
  ]
});
