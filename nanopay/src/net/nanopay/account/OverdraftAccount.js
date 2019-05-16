foam.CLASS({
  package: 'net.nanopay.account',
  name: 'OverdraftAccount',
  extends: 'net.nanopay.account.DigitalAccount',

    // relationships: DebtAccounts - see below
  
  documentation: 'An OverDraft Account which can incur debt.  When a transfer exceeds the balance, the funds can be borrowed from the Backing Account. The borrowed funds, lender, terms, are captured in a DebtAccount.',

  implements: [
    'net.nanopay.account.Detable'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.model.Currency',
    'java.util.List'
  ],

  properties: [
    {
      class: 'Long',
      name: 'overdraftLimit',
      value: 0
    },
    {
      // part of Accountification 
      name: 'backingAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account to forward payment request to.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO.where(
            X.data.AND(
              X.data.NOT(X.data.INSTANCE_OF(X.data.ZeroAccount))
            )
          ),
          placeholder: '--',
          objToChoice: function(lenderAccount) {
            return [backingAccount.id, backingAccount.name];
          }
        });
      }
    },
  ],
  methods: [
    {
      name: 'incurDebt',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'creditor',
          type: 'net.nanopay.account.Account'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
      // find creditor, create if not exits
      // update debt balance 
      `
    },  
    {
      name: 'availableLimit',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      Long totalDebt = 0L;
      DAO dao = getDebts(x);
      ProxySink decoratedSink = new ProxySink(x, null) {
        @Override
        public void put(Object obj, foam.core.Detachable sub) {
          DebtAccount da = (DebtAccount);
          totalDebt += da.findBalance(x);
        }
      };
      getDebts(x).select_(x, decoratedSink, null, null, null);
      return this.overdraftLimit - totalDebt;
      `,
    },
// name: payPay
  //   {
  //     documentation: 'OverDraft account provides liquidity via a backing account. It can have a positive or negative balance.',
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
  //       long bal = balance == null ? 0L : balance.getBalance();
  //       if ( amount < 0 &&
  //            -amount > bal + getOverdraftLimit() ) {
  //         foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
  //         logger.debug(this, "amount", amount, "balance", bal);
  //         throw new RuntimeException("Insufficient balance/overdraft in account " + this.getId());
  //       }
  //     `
  //   }
   ]

//   axioms: [
//     {
//       buildJavaClass: function(cls) {
//         cls.extras.push(`
//           static public OverdraftAccount findDefault(X x, User user, String currency) {
//             Logger logger = (Logger) x.get("logger");
//             OverdraftAccount account = null;

//             synchronized(String.valueOf(user.getId()).intern()) {
//               logger.info(OverdraftAccount.class.getSimpleName(), "findDefault", "user", user.getId(), "currency", currency);

//               // Select currency of user's country.
//               String denomination = currency;
//               if ( denomination == null ) {
//                 denomination = "CAD";
//                 String country = "CA";
//                 Address address = user.getAddress();

//                 if ( address != null && address.getCountryId() != null ) {
//                   country = address.getCountryId().toString();
//                 }

//                 DAO currencyDAO = (DAO) x.get("currencyDAO");
//                 List currencies = ((ArraySink) currencyDAO
//                   .where(EQ(Currency.COUNTRY, country))
//                   .select(new ArraySink())).getArray();

//                 if ( currencies.size() == 1 ) {
//                   denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
//                 } else if ( currencies.size() > 1 ) {
//                   logger.warning(OverdraftAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
//                 }
//               }

//               DAO accountDAO  = user.getAccounts(x);

//               List accounts = ((ArraySink) accountDAO
//                 .where(
//                   AND(
//                     EQ(Account.ENABLED, true),
//                     INSTANCE_OF(OverdraftAccount.class),
//                     EQ(Account.DENOMINATION, denomination),
//                     EQ(Account.IS_DEFAULT, true)
//                   )
//                 )
//                 .select(new ArraySink())).getArray();

//               if ( accounts.size() == 0 ) {
//                 account = new OverdraftAccount();
//                 account.setDenomination(denomination);
//                 account.setIsDefault(true);
//                 account.setOwner(user.getId()); // required until user.getAccounts()
//                 account = (OverdraftAccount) accountDAO.put(account);
//               } else {
//                 if ( accounts.size() > 1 ) {
//                   logger.warning(OverdraftAccount.class.getClass().getSimpleName(), "user", user.getId(), "multiple accounts found for denomination", denomination, "Using first found.");
//                 }
//                 account = (OverdraftAccount) accounts.get(0);
//               }
//             }
//             return account;
//           }
//         `);
//       }
//     }
//   ]
});

// foam.RELATIONSHIP({
//   sourceModel: 'net.nanopay.account.Account',
//   targetModel: 'net.nanopay.account.OverdraftAccount',
//   inverseName: 'backingAccount',
//   forwardName: 'fundedAccounts',
//   cardinality: '1:*',
//   targetDAOKey: 'accountDAO',
//   targetProperty: {
//     view: function(_, X) {
//       var E = foam.mlang.Expressions.create();
//       return {
//         class: 'foam.u2.view.ReferenceView',
//         dao: X.accountDAO.orderBy(net.nanopay.account.Account.NAME),
//         placeholder: 'select Backing Account',
//         objToChoice: function(o) { return [o.id, o.name ? o.name : '' + o.id]; }
//       };
//     }
//   }
// );

