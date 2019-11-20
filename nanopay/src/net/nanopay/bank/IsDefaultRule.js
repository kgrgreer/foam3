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
    'foam.dao.DAO',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            BankAccount bankAccount = (Bank Account) obj;
            DAO accountDAO = (DAO) x.get("accountDAO");

            if ( bankAccount.getStatus().equals(BankAccountStatus.VERIFIED) ) {
              throw new RuntimeException("Unable to set unverified bank accounts as default);
            }

            BankAccount currentDefault = (BankAccount) BankAccount.findDefault(x, bankAccount.findOwner(x), bankAccount.getDenomination());
            
            if ( currentDefault != null ) {
              currentDefault = (BankAccount) currentDefault.fclone();
              currentDefault.setIsDefault(false);
              accountDAO.put(currentDefault);
            }
         }
        },"Sets old account isDefault to false.");
      `
    }
  ]
});
