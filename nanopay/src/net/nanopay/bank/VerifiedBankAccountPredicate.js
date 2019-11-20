foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'VerifiedBankAccountPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      return AND(
        EQ(DOT(NEW_OBJ, INSTANCE_OF(BankAccount.class)), true),
        EQ(DOT(NEW_OBJ, BankAccount.STATUS), BankAccoutStatus.VERIFIED),
        OR(
          EQ(DOT(OLD_OBJ, BankAccount.STATUS), BankAccountStatus.DISABLED)
          EQ(DOT(OLD_OBJ, BankAccount.STATUS), BankAccountStatus.UNVERIFIED)
        )
      ).f(obj);
      `
    }
  ]
});
