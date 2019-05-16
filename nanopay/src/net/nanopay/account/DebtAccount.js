foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DebtAccount',
  extends: 'net.nanopay.account.DigitalAccount',
  documentation: 'Account which captures a debt obligation, the creditor, and the debtor.',

  properties: [
    // name: 'terms' - future - capture the repayment, interest, ...
    {
      name: 'creditorAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account backing the debit amount.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
            X.data.AND(
              X.data.NOT(X.data.INSTANCE_OF(X.data.ZeroAccount))
            )
          ),
          placeholder: '--',
          objToChoice: function(lenderAccount) {
            return [creditorAccount.id, creditorAccount.name];
          }
        });
      }
    }
  ],
  // methods: [
  //   {
  //     documentation: 'Allow Account specific validation of balance operation. Trust accounts can be negative, for example.',
  //     name: 'validateAmount',
  //     args: [
  //       {
  //         name: 'x',
  //         type: 'Context'
  //       },
  //       {
  //         name: 'balance',
  //         type: 'net.nanopay.account.Balance'
  //       },
  //       {
  //         name: 'amount',
  //         type: 'Long'
  //       }
  //     ],
  //     javaCode: `
  //       // // debt balance will be negative
  //       // // but allow positive until logic for overpaying exists.

  //       // long bal = balance == null ? 0L : balance.getBalance();
  //       // if ( amount > 0 &&
  //       //      amount > -balance.getBalance()) {
  //       //   throw new RuntimeException("Invalid transfer, "+this.getClass().getSimpleName()+" account balance must remain <= 0. " + this.getClass().getSimpleName()+"."+getName());
  //       // }
  //     `
  //   }
  // ]

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public DebtAccount findDebtAccount(X x, Account owner, Account creditor) {
            Logger logger = (Logger) x.get("logger");
            DebtAccount account = null;

            synchronized(String.valueOf(owner.getId()).intern()) {
              logger.info(DebtAccount.class.getSimpleName(), "findDebtAccount", "owner", owner.getId(), "creditor", creditor);
              DAO dao = (DAO) x.get("debtAccountDAO");
              List accounts = ((ArraySink) dao
                .where(
                  AND(
                    EQ(Account.ENABLED, true),
                    EQ(Account.OWNER, owner.getId()),
                    EQ(Account.CREDITOR, creditor.getId())
                  )
                )
                .select(new ArraySink())).getArray();
              if ( accounts.size() == 0 ) {
                account = new DebtAccount();
                account.setDenomination(creditor.getDenomination());
                account.setOwner(owner.getId());
                account = (DebtAccount) accountDAO.put(account);
              } else {
                if ( accounts.size() > 1 ) {
                  logger.warning(DigitalAccount.class.getClass().getSimpleName(), "multiple accounts found for", "owner", owner.getId(), "creditor", creditor.getId());
                }
                account = (DebtAccount) accounts.get(0);
              }
              return account;
            }
          }`
        );
      }
    }
  ]
});
