foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'DigitalTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for planning digital transactions',

  javaImports: [
    'net.nanopay.tx.DigitalTransaction',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

        DigitalTransaction dt = new DigitalTransaction();
        dt.copyFrom(requestTxn);
        dt.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
        dt.setName(dt.getSourceCurrency() + " Digital Transaction");
        quote.addTransfer(dt.getSourceAccount(), -dt.getAmount());
        quote.addTransfer(dt.getDestinationAccount(), dt.getAmount());
        return dt;
      `
    },
  ]
});

