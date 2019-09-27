foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BusinessCreated',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if business is created',

  javaImports: [
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return EQ(DOT(NEW_OBJ, CLASS_OF(Business.class)), true).f(obj);
      `
    }
  ]
});
