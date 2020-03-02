foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'FOPPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'A planner for planning Free of Payment (FOP) type transactions',

  javaImports: [
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.account.SecuritiesAccount',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

        SecurityTransaction secTx = new SecurityTransaction.Builder(x).build();
        secTx.copyFrom(requestTxn);
        secTx.setName("Digital Security Transaction");
        addTransfer(((SecuritiesAccount) quote.getSourceAccount()).getSecurityAccount(x, quote.getSourceUnit()).getId(), -secTx.getAmount());
        addTransfer(((SecuritiesAccount) quote.getDestinationAccount()).getSecurityAccount(x, quote.getDestinationUnit()).getId(), secTx.getAmount());

        return secTx;
      `
    }
  ]
});
