foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'RbcCOTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans CO Transaction for RBC',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.rbc.RbcCOTransaction',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
      Transaction t = new RbcCOTransaction.Builder(x).build();
      t.copyFrom(requestTxn);
      // TODO: use EFT calculation process
      t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      t.setIsQuoted(true);

      return t;

      `
    },
  ]
});
