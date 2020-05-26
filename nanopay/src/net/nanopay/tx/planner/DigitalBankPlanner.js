foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'DigitalBankPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for digital to bank where the owners differ`,

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
        Account destinationAccount = quote.getDestinationAccount();
        foam.nanos.auth.User bankOwner = destinationAccount.findOwner(x);
        Account digital = DigitalAccount.findDefault(x, bankOwner, requestTxn.getDestinationCurrency());
        
        // digital -> digital
        Transaction digitalTxn = new Transaction();
        digitalTxn.copyFrom(requestTxn);
        digitalTxn.setDestinationAccount(digital.getId());

        // cash out 
        Transaction co = new Transaction();
        co.copyFrom(requestTxn);
        co.setSourceAccount(digital.getId());

        Transaction[] digitals = multiQuoteTxn(x, digitalTxn);
        Transaction[] COs = multiQuoteTxn(x, co);
        for ( Transaction tx1 : digitals ) {
          for ( Transaction tx2 : COs ) {
            Transaction Digital = (Transaction) tx1.fclone();
            Digital.addNext((Transaction) tx2.fclone());
            quote.getAlternatePlans_().add(Digital);
          }
        }
        return null;
      `
    },
  ]
});
