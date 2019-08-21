foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'InstitutionClearingTimeRule',
  extends: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'institution'
    },
    {
      name: 'action',
      javaFactory: `
        return (x, obj, oldObj, ruler, agency) -> {
          Transaction transaction = (Transaction) obj;
          Account account = findAccount(x, transaction);

          if ( account instanceof BankAccount
            && getInstitution() == ((BankAccount) account).getInstitution()
          ) {
            incrClearingTime(transaction);
          }
        };
      `
    }
  ]
});
