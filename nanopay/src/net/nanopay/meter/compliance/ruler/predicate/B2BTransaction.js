foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'B2BTransaction',

  documentation: 'Predicate for bank to bank transaction.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Transaction transaction = (Transaction) NEW_OBJ.f(obj);
        Account sourceAccount = transaction.findSourceAccount((X) obj);
        Account destinationAccount = transaction.findDestinationAccount((X) obj);

        return sourceAccount instanceof BankAccount
          && destinationAccount instanceof BankAccount;
      `
    }
  ]
});
