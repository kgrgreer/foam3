foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'GenericFXPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Make a Fx Transaction by simply creating/destroying funds.',

  javaImports: [
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.account.TrustAccount',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        FXTransaction fx = new FXTransaction();
        fx.copyFrom(requestTxn);
        fx.setName("Foreign Exchange "+quote.getSourceUnit()+" to "+quote.getDestinationUnit());

        quote.addTransfer(TrustAccount.find(x, quote.getSourceAccount()).getId(), fx.getAmount());
        quote.addTransfer(quote.getSourceAccount().getId(), -fx.getAmount());

        quote.addTransfer(TrustAccount.find(x, quote.getDestinationAccount()).getId(), - fx.getDestinationAmount());
        quote.addTransfer(quote.getDestinationAccount().getId(), fx.getDestinationAmount());

        fx.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);

        return fx;
      `
    },
  ]
});

