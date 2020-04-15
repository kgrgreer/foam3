foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'RbcVerificationTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans Verification Transaction for RBC',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.rbc.RbcVerificationTransaction',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

      RbcVerificationTransaction t = new RbcVerificationTransaction.Builder(x).build();
      t.copyFrom(requestTxn);
      t.setIsQuoted(true);

      return t;

      `
    },
  ]
});
