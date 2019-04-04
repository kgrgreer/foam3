foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'Digital Account. Default to monetary denomination.',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.DigitalAccountService',
    'net.nanopay.model.Currency',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.AbstractSink',
    'foam.core.Detachable',
    'foam.util.SafetyUtil',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  imports: [
    'accountDAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'denomination',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD'
    }
  ],

  methods: [
   {
     name: 'closeChildren_',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'beneficiary',
         type: 'net.nanopay.account.Account'
       }
     ],
     documentation: 'get all children and call close on them',
     javaCode:`

       Logger logger = (Logger) x.get("logger");
       String myName = this.getName();
       DAO accountDAO = (DAO) x.get("accountDAO");
       accountDAO
         .where(
           AND(
             EQ( DigitalAccount.DELETED, false ),
             EQ( DigitalAccount.PARENT, this.getId() ),
             INSTANCE_OF( DigitalAccount.class )
           )
         )
         .select( new AbstractSink() {
           @Override
           public void put(Object o, Detachable d ) {
             DigitalAccount account = (DigitalAccount) ( (DigitalAccount) o).deepClone();
               account.close(x, beneficiary);
           }
         });
     `
   },
   {
     name: 'close',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'beneficiary',
         type: 'net.nanopay.account.Account'
       }
     ],
     documentation: 'Close all my children accounts, they send money to beneficiary, I do to and then get closed.',
     javaCode: `

     DAO accountDAO = (DAO) x.get("accountDAO");
     validateBeneficiary(beneficiary);

     if ( this.findLiquiditySetting(x) != null ) {
       this.clearLiquiditySetting();
       accountDAO.put(this);
     }


     this.closeChildren_(x, this);

     long balance = (long) this.findBalance(x);

     if ( balance > 0 && ! SafetyUtil.equals( this.getId(), beneficiary.getId() ) ) {
       Transaction txn = new Transaction.Builder(x)
         .setAmount(balance)
         .setSourceAccount(this.getId())
         .setDestinationAccount(beneficiary.getId())
         .build();
       ( (DAO) x.get("transactionDAO") ).put(txn);

       this.setDeleted(true);
       accountDAO.put(this);
     }
     `
   },
   {
     name: 'validateBeneficiary',
     args: [
       {
         name: 'beneficiary',
         type: 'net.nanopay.account.Account'
       }
     ],
     documentation: 'Rules which ensure that the beneficiary account is allowed to receive my money when closing account',
     javaCode: `
     if ( ! SafetyUtil.equals( beneficiary.getDenomination(),this.getDenomination() ) )
       throw new RuntimeException( "Can only use a beneficiary account in the same currency" );
     if ( beneficiary instanceof AggregateAccount )
       throw new RuntimeException( "Cannot send currency to an Aggregate Account" );
     if ( ! ( beneficiary instanceof DigitalAccount ) )
       throw new RuntimeException( "Can only use a Digital Account for a beneficiary" );
     `
   },

  {
       name: 'closeAccount',
       args: [
         {
           name: 'x',
           type: 'Context'
         },
         {
           name: 'beneficiary',
           type: 'net.nanopay.account.Account'
         }
       ],
       documentation: 'close this account and all sub accounts, by moving all money to me, then I send to beneficiary',
       javaCode: `

        if ( SafetyUtil.equals( beneficiary.getId(), this.getId() ) )
          throw new RuntimeException( "Cannot set the beneficiary account equal to the account that is being closed.");
        /*TODO Also can not set the beneficiary equal to the account that will be closed as a result of this account being closed.
         if I can use a beneficiary.isSomeParent(this) function this would be easy to check.
         Instead of walking down tree, walk up tree from beneficiary to search for 'this'. Could be implemented in 'Account'?
        */
         validateBeneficiary(beneficiary);
         close(x,this);
         long balance = (long) this.findBalance(x);

         if ( balance > 0 ) {
           Transaction txn = new Transaction.Builder(x)
             .setAmount(balance)
             .setSourceAccount(this.getId())
             .setDestinationAccount(beneficiary.getId())
             .build();
           ((DAO) x.get("transactionDAO")).put(txn);
         }

         this.setDeleted(true);
         ((DAO) x.get("accountDAO")).put(this);
       `
   }


  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public DigitalAccount findDefault(X x, User user, String currency) {
            Logger logger = (Logger) x.get("logger");
            DigitalAccount account = null;

            synchronized(String.valueOf(user.getId()).intern()) {
              logger.info(DigitalAccount.class.getSimpleName(), "findDefault", "user", user.getId(), "currency", currency);

              // Select currency of user's country.
              String denomination = currency;
              if ( denomination == null ) {
                denomination = "CAD";
                String country = "CA";
                Address address = user.getAddress();

                if ( address != null && address.getCountryId() != null ) {
                  country = address.getCountryId().toString();
                }

                DAO currencyDAO = (DAO) x.get("currencyDAO");
                List currencies = ((ArraySink) currencyDAO
                  .where(EQ(Currency.COUNTRY, country))
                  .select(new ArraySink())).getArray();

                if ( currencies.size() == 1 ) {
                  denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
                } else if ( currencies.size() > 1 ) {
                  logger.warning(DigitalAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                }
              }

              DAO accountDAO  = user.getAccounts(x);

              List accounts = ((ArraySink) accountDAO
                .where(
                  AND(
                    EQ(Account.ENABLED, true),
                    INSTANCE_OF(DigitalAccount.class),
                    EQ(Account.DENOMINATION, denomination),
                    EQ(Account.IS_DEFAULT, true)
                  )
                )
                .select(new ArraySink())).getArray();

              if ( accounts.size() == 0 ) {
                account = new DigitalAccount();
                account.setDenomination(denomination);
                account.setIsDefault(true);
                account.setOwner(user.getId()); // required until user.getAccounts()
                account = (DigitalAccount) accountDAO.put(account);
              } else {
                if ( accounts.size() > 1 ) {
                  logger.warning(DigitalAccount.class.getClass().getSimpleName(), "user", user.getId(), "multiple accounts found for denomination", denomination, "Using first found.");
                }
                account = (DigitalAccount) accounts.get(0);
              }
            }

            return account;
          }
        `);
      }
    }
  ]
});
