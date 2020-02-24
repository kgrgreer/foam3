foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'GenericCIPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for doing Cash Ins for any currency instantly.',

  javaImports: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.account.TrustAccount',
  ],

  //TODO: Predicate:
  /*if ( sourceAccount instanceof BankAccount &&
                           destinationAccount instanceof DigitalAccount ) */

  methods: [
    {
      name: 'plan',
      javaCode: `

      CITransaction cashIn = new CITransaction();
      cashIn.copyFrom(requestTxn);
      // i think these are backwards.. should use the trust of the dest accnt here.
      TrustAccount trustAccount = TrustAccount.find(x, quote.getSourceAccount());

      addTransfer(trustAccount.getId(), - cashIn.getAmount());
      addTransfer(quote.getDestinationAccount().getId(), cashIn.getAmount());

      cashIn.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);

      return cashIn;

      `
    },
  ]
});

