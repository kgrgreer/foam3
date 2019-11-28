foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'IsSecurityQuote',

  documentation: 'A predicate that ensures the object is a securities transaction quote',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.SecurityAccount',
    'net.nanopay.tx.TransactionQuote'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        FObject nu  = (FObject) NEW_OBJ.f(obj);
        if ( ! ( nu instanceof TransactionQuote ) ) return false;
        TransactionQuote tq = (TransactionQuote) nu;

        if ( tq.getSourceAccount() instanceof SecurityAccount &&
          tq.getDestinationAccount() instanceof SecurityAccount ) 
          return true;

        return false;

      `
    }
  ]
});
