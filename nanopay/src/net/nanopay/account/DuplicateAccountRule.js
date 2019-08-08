foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DuplicateAccountRule',

  documentation: `Validator that checks if a previous account
    With same name, description, parent and currency exists.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.ShadowAccount'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( (obj instanceof ShadowAccount || obj instanceof DigitalAccount) ) {
          Account account = (Account) obj;
          Count count = (Count) ((DAO) x.get("accountDAO"))
            .where(
              AND(
                EQ(Account.NAME, account.getName()),
                EQ(Account.DENOMINATION, account.getDenomination()),
                EQ(Account.PARENT, account.getParent()),
                EQ(Account.DESC, account.getDesc())
              )
            )
            .limit(1)
            .select(new Count());
          if ( count.getValue() > 0 ) {
            Logger logger = (Logger) x.get("logger");
            logger.log("Cannot create account as a duplicate already exists.");
            throw new  RuntimeException("You cannot create this account because it is a duplicate of another.");
          }
        }
      `
    }
  ]
});
