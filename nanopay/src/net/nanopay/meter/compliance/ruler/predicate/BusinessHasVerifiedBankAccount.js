foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BusinessHasVerifiedBankAccount',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! (NEW_OBJ.f(obj) instanceof Business) ) return false;
        Business business = (Business) NEW_OBJ.f(obj);
        BankAccount bankAccount = (BankAccount) ((DAO) ((X) obj).get("localAccountDAO")).find(AND(
          EQ(BankAccount.OWNER,business.getId()),
          INSTANCE_OF(BankAccount.class)));
        return bankAccount != null 
          && BankAccountStatus.VERIFIED == bankAccount.getStatus();
      `
    }
  ]
});
