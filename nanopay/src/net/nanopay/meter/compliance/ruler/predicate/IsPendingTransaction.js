foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsPendingTransaction',

  documentation: `Returns true if new object is a transaction with
    PENDING or PENDING_PARENT_COMPLETED status.`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'strict',
      value: false
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return (getStrict()
          ? EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.PENDING)
          : OR(
              EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.PENDING),
              EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.PENDING_PARENT_COMPLETED)
            )
        ).f(obj);
      `
    }
  ]
});
