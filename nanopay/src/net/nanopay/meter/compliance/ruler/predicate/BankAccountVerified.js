foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BankAccountVerified',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        BankAccount oldBankAccount = (BankAccount) OLD_OBJ.f(obj);
        return (oldBankAccount != null) ?
          AND(
            EQ(DOT(NEW_OBJ, INSTANCE_OF(BankAccount.class)), true),
            EQ(DOT(NEW_OBJ, BankAccount.STATUS), BankAccountStatus.VERIFIED),
            NEQ(DOT(OLD_OBJ, BankAccount.STATUS), BankAccountStatus.VERIFIED)
          ).f(obj) :
          AND(
            EQ(DOT(NEW_OBJ, INSTANCE_OF(BankAccount.class)), true),
            EQ(DOT(NEW_OBJ, BankAccount.STATUS), BankAccountStatus.VERIFIED)
          ).f(obj);
      `
    }
  ]
});
