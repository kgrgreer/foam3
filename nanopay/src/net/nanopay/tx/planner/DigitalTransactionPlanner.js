foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'DigitalTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Planner for planning digital transactions',

  javaImports: [
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.EQ',
    'foam.dao.DAO'
  ],
//TODO: predicate: both accounts are digital, and currency is the same.

  methods: [
    {
      name: 'plan',
      javaCode: `

        DigitalTransaction dt = new DigitalTransaction();
        dt.copyFrom(requestTxn);
        addTransfer(dt.getSourceAccount(), -dt.getAmount());
        addTransfer(dt.getDestinationAccount(), dt.getAmount());
        return dt;

      `
    },
  ]
});

