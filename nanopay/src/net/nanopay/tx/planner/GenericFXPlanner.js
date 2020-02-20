foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'GenericFXPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Make a Fx Transaction by simply creating/destroying funds.',

  javaImports: [
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.account.TrustAccount',
  ],

//TODO: Predicate: source currency/destination currency different, and both digital accounts.
  methods: [
    {
      name: 'plan',
      javaCode: `
        FXTransaction fx = new FXTransaction();
        fx.copyFrom(requestTxn);

        addTransfer(TrustAccount.find(getX(), quote.getSourceAccount()).getId(), fx.getAmount());
        addTransfer(quote.getSourceAccount().getId(), -fx.getAmount());

        addTransfer(TrustAccount.find(getX(), quote.getDestinationAccount()).getId(), - fx.getAmount());
        addTransfer(quote.getDestinationAccount().getId(), fx.getAmount());

        fx.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);

        return fx;
      `
    },
  ]
});

