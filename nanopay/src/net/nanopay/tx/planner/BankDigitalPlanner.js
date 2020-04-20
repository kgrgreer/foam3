foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'BankDigitalPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for bank to digital where the owners differ`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'multiPlan_',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Account sourceAccount = quote.getSourceAccount();
        DigitalAccount sourceDigitalAccount = DigitalAccount.findDefault(x, sourceAccount.findOwner(x), sourceAccount.getDenomination());
        
        // Split 1: ABank -> ADigital
        Transaction t1 = new Transaction(x);
        t1.copyFrom(requestTxn);
        t1.setDestinationAccount(sourceDigitalAccount.getId());

        // ADigital -> BDigital
        Transaction t2 = new Transaction(x);
        t2.copyFrom(requestTxn);
        t2.setSourceAccount(sourceDigitalAccount.getId());

        Transaction[] digitals = multiQuoteTxn(x, t2);
        Transaction[] CIs = multiQuoteTxn(x, t1);
        for ( Transaction tx1 : digitals ) {
          for ( Transaction tx2 : CIs ) {
            tx2.addNext(tx1);
            quote.getAlternatePlans_().add(tx2);
          }
        }
        return null;
      `
    },
  ]
});
