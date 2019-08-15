foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessCreatedPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      if ( ! (NEW_OBJ.f(obj) instanceof AFEXBusiness) ) return false;
      AFEXBusiness afexBusiness = (AFEXBusiness) NEW_OBJ.f(obj);
      return afexBusiness.getApiKey() != null
        && afexBusiness.getAccountNumber() != null;
      `
    }
  ]
});
