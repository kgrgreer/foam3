foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ParentCompleteToPendingRule',

  documentation: `changes PENDING_PARENT_COMPLETED to PENDING`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      Transaction tx = (Transaction) obj;
        if( tx.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED && ((Transaction) tx.findParent(x)).getStatus() == TransactionStatus.COMPLETED)
          tx.setStatus(TransactionStatus.PENDING);

      `
    }
  ]
});
