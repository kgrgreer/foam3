foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXSubmitPaymentPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      if ( ! (NEW_OBJ.f(obj) instanceof AFEXTransaction) ) return false;
      AFEXTransaction afexTransaction = (AFEXTransaction) NEW_OBJ.f(obj);
      return afexTransaction.getStatus() == TransactionStatus.PENDING
        && SafetyUtil.isEmpty( afexTransaction.getReferenceNumber() );
      `
    }
  ]
});
