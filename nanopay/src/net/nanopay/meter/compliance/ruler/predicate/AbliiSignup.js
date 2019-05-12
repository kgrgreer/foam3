foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'AbliiSignup',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user signup for Ablii',

  javaImports: [
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, User.GROUP), "sme"),
          EQ(OLD_OBJ, null)
        ).f(obj);
      `
    }
  ]
});
