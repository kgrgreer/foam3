foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'PausedOrScheduledTransaction',

  documentation: 'Returns true transaction status is PAUSED or SCHEDULED.',

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
        return OR(
          EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.PAUSED),
          EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.SCHEDULED)
        ).f(obj);
      `
    }
  ]
});