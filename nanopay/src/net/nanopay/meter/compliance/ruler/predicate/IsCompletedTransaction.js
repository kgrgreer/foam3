foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsCompletedTransaction',

  documentation: `Returns true if new object is a transaction with COMPLETED status.`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return 
          EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.COMPLETED)
        .f(obj);
      `
    }
  ]
});
