foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXCreateTradePredicate',
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
        EQ(DOT(NEW_OBJ, AFEXTransaction.STATUS), TransactionStatus.PENDING_PARENT_COMPLETED),
        EQ(DOT(NEW_OBJ, AFEXTransaction.AFEX_TRADE_RESPONSE_NUMBER), 0)
      ).f(obj);
      `
    }
  ]
});
