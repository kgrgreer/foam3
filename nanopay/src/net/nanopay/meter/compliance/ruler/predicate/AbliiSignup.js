foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'AbliiSignup',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user signup for Ablii',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.contacts.Contact',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(OLD_OBJ, null),
          EQ(DOT(NEW_OBJ, User.GROUP), "sme"),
          NEQ(DOT(NEW_OBJ, INSTANCE_OF(Contact.class)), true)
        ).f(obj);
      `
    }
  ]
});
