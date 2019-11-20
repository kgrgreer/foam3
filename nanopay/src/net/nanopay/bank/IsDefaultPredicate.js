foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'IsDefaultPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        EQ(DOT(NEW_OBJ, INSTANCE_OF(BankAccount.class)), true),
        EQ(DOT(NEW_OBJ, BankAccount.IS_DEFAULT), true),
        EQ(DOT(OLD_OBJ, BankAccount.IS_DEFAULT), false),
      ).f(obj);
      `
    }
  ]
});
