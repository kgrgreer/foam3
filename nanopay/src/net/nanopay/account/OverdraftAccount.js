foam.CLASS({
  package: 'net.nanopay.account',
  name: 'OverdraftAccount',
  extends: 'net.nanopay.account.DigitalAccount',

    // relationships: DebtAccounts - see below
  
  documentation: 'An OverDraft Account which can incur debt.  When a transfer exceeds the balance, the funds can be borrowed from the Backing Account. The borrowed funds, lender, terms, are captured in a DebtAccount.',

  implements: [
    'net.nanopay.account.Debtable',
    'foam.mlang.Expressions',
  ],
    requires: [
    'net.nanopay.account.DebtAccount',
    ],

  javaImports: [
    'net.nanopay.account.DebtAccount',
    'foam.dao.DAO',
    'foam.mlang.MLang'
  ],

  properties: [
    {
      name: 'debtAccount',
      class: 'Reference',
      of: 'net.nanopay.account.DebtAccount',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
              X.data.INSTANCE_OF(X.data.DebtAccount)
          ),
          placeholder: '--',
          objToChoice: function(debtAccount) {
            return [debtAccount.id, debtAccount.name];
          }
        });
      }
    }
  ],

  methods: [
    {
      name: 'checkDebtLimit',
      args: [
        {
        name: 'x',
        type: 'Context'
        }
      ],
      type: 'Long',
      javaCode: `
        // lets think about finding total Debts of all debt accounts
        DebtAccount da = ((DebtAccount)((DAO) x.get("debtAccountDAO")).find(MLang.EQ(DebtAccount.ID, getDebtAccount())));
        return ((Long) da.findBalance(x)) + da.getLimit();
      `
    },
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
      long bal = balance == null ? 0L : balance.getBalance();

        if ( amount < 0 &&
             -amount > bal+ checkDebtLimit(x) ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal, "debtLimit", checkDebtLimit(x) );
          throw new RuntimeException("Insufficient balance in account and overdraft exceeded " + this.getId());
        }
      `
    }
  ]
});


