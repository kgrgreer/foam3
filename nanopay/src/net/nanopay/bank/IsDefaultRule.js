foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'IsDefaultRule',

  documentation: `
      Rule prevents users from setting default on non verified bank accounts
      as well as setting old default account to false if isDefault is being set to true on obj.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        BankAccount bankAccount = (BankAccount) obj;
        if ( ! bankAccount.getStatus().equals(BankAccountStatus.VERIFIED) ) {
          throw new RuntimeException("Unable to set unverified bank accounts as default");
        }

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO accountDAO = (DAO) x.get("accountDAO");

            BankAccount currentDefault = BankAccount.findDefault(x, bankAccount.findOwner(x), bankAccount.getDenomination());
            
            if ( currentDefault != null ) {
              currentDefault = (BankAccount) currentDefault.fclone();
              currentDefault.setIsDefault(false);
              accountDAO.put(currentDefault);
            }
         }
        }, "Sets old account isDefault to false.");
      `
    }
  ]
});
