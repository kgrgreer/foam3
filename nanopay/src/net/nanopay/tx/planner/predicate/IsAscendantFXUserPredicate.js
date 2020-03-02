foam.CLASS({
  package: 'net.nanopay.tx.planner.predicate',
  name: 'IsAscendantFXUserPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the payer is an AFEX User',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.ascendantfx.AscendantFXUser',
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
      return ! SafetyUtil.isEmpty(AscendantFXUser.getUserAscendantFXOrgId(((X) obj),  
        tq.getSourceAccount().getOwner()));
      
      `
    }
  ]
});