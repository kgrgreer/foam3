foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'RbcCITransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans CI Transaction for RBC',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.rbc.RbcCITransaction',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

      RbcCITransaction t = new RbcCITransaction.Builder(x).build();
      t.copyFrom(requestTxn);
      // TODO: use EFT calculation process
      t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);

      return t;

      `
    },
  ]
});
