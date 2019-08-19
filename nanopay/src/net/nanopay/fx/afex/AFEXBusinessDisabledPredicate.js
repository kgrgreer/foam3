foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessDisabledPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      if ( ! (NEW_OBJ.f(obj) instanceof AFEXBusiness) ) return false;
      AFEXBusiness afexBusiness = (AFEXBusiness) NEW_OBJ.f(obj);
      return ! afexBusiness.getEnabled()
        || "Disabled".equals(afexBusiness.getStatus());
      `
    }
  ]
});
