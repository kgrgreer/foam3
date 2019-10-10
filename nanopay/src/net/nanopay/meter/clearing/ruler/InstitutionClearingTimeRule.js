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
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institution',
      required: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.institutionDAO,
          placeholder: '--',
          objToChoice: function(institution) {
            return [institution.id, institution.name];
          }
        });
      },
      section: 'basicInfo'
    },
    {
      name: 'action',
      javaGetter: `
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
