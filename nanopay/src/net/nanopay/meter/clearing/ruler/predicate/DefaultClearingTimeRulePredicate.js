foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler.predicate',
  name: 'DefaultClearingTimeRulePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `The default predicate for ClearingTimeRule.

    Checking if transaction is a CICO transaction and status changes to SENT.`,

  javaImports: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          OR(
            EQ(DOT(NEW_OBJ, INSTANCE_OF(CITransaction.class)), true),
            EQ(DOT(NEW_OBJ, INSTANCE_OF(COTransaction.class)), true)
          ),
          NEQ(DOT(OLD_OBJ, Transaction.STATUS), TransactionStatus.SENT),
          EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.SENT)
        ).f(obj);
      `
    }
  ]
});
