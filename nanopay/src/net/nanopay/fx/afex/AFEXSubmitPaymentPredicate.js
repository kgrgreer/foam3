foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXSubmitPaymentPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'static foam.mlang.MLang.*',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        EQ(DOT(NEW_OBJ, INSTANCE_OF(AFEXTransaction.class)), true),
        EQ(DOT(NEW_OBJ, AFEXTransaction.STATUS), TransactionStatus.SENT),
        OR(
          EQ(DOT(NEW_OBJ, AFEXTransaction.REFERENCE_NUMBER), null),
          EQ(DOT(NEW_OBJ, AFEXTransaction.REFERENCE_NUMBER), "")
        )
      ).f(obj);
      `
    }
  ]
});
