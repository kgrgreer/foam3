foam.CLASS({
  package: 'net.nanopay.tx.planner.predicate',
  name: 'IsAFEXUserPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the payer is an AFEX User',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.tx.TransactionQuote',

    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      FObject nu  = (FObject) NEW_OBJ.f(obj);
      if ( ! ( nu instanceof TransactionQuote ) ) return false;
      TransactionQuote tq = (TransactionQuote) nu;
      AFEXServiceProvider afexService = (AFEXServiceProvider) ((X) obj).get("afexServiceProvider");
      return null != afexService.getAFEXBusiness(((X) obj), tq.getSourceAccount().getOwner());
      
      `
    }
  ]
});