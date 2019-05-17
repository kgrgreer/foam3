foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DebtAccount',
  extends: 'net.nanopay.account.DigitalAccount',
  documentation: 'Account which captures a debt obligation, the creditor, and the debtor.',

  implements: [
      'foam.mlang.Expressions',
  ],

  requires: [
  'net.nanopay.account.OverdraftAccount',
  'net.nanopay.account.ZeroAccount',
  'net.nanopay.account.Account'
  ],

  properties: [
    // name: 'terms' - future - capture the repayment, interest, ...
    {
      name: 'debtorAccount',
      label: 'Debtor',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account which owes this debt.',
      visibility: 'RO',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
             X.data.INSTANCE_OF(X.data.OverdraftAccount)
          ),
          placeholder: '--',
          objToChoice: function(debtorAccount) {
            return [debtorAccount.id, debtorAccount.name];
          }
        });
      }
    },
    {
      name: 'creditorAccount',
      label: 'Creditor',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account which is owned this debt.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
            X.data.AND(
              X.data.NOT(X.data.INSTANCE_OF(X.data.ZeroAccount))
            )
          ),
          placeholder: '--',
          objToChoice: function(creditorAccount) {
            return [creditorAccount.id, creditorAccount.name];
          }
        });
      }
    },
    {
      class: 'Long',
      name: 'limit',
      value: 0
    }
  ],

  methods: [
    {
      documentation: 'Debt account is always negative',
      name: 'validateAmount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
        if ( amount > 0 &&
             amount > -balance.getBalance() ||
             amount < 0 &&
             amount + balance.getBalance() < getLimit() ) {
          throw new RuntimeException("Invalid transfer, "+this.getClass().getSimpleName()+" account balance must remain between [limit, 0]" + this.getClass().getSimpleName()+"."+getName());
        }
      `
    }
  ]
});
