foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'EnforceOneDefaultBankAccountPerCurrencyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Checks default bank account with same currency already exists, if so, prevents creating another',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.AbstractSink',
    'foam.core.Detachable',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*',

    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',

    'java.util.List',
    'java.util.Iterator'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( ! ( obj instanceof BankAccount ) ) {
        return getDelegate().put_(x, obj);
      }
      BankAccount account = (BankAccount) obj;
      BankAccount existingAccount = (BankAccount) getDelegate().find(account.getId());
      if ( existingAccount == null ) {
        // new Account
        List data  = ((ArraySink) getDelegate().inX(x)
          .where(
                 AND(
                     INSTANCE_OF(BankAccount.class),
                     EQ(BankAccount.OWNER, account.getOwner()),
                     EQ(BankAccount.DENOMINATION, account.getDenomination()),
                     EQ(BankAccount.IS_DEFAULT, true)
                    )
                 )
          .select(new ArraySink())).getArray();

          if ( data.size() == 0 ) {
            account.setIsDefault(true); // No default account for currency so make this default
          } else if ( data.size() > 0 && account.getIsDefault() ) {
            Iterator i = data.iterator();
            while ( i.hasNext() ) {
              try {
                BankAccount d = (BankAccount) ((BankAccount) i.next()).deepClone();
                d.setIsDefault(false);
                getDelegate().put_(x, d);
              } catch ( Throwable ignored ) { }
            }
          }
      } else {
        // old account
        if ( existingAccount.getEnabled() && ! account.getEnabled() && account.getIsDefault() ) {
          // default Account getting disabled
          setNewDefaultAccount(x, account);
        }
      }

      return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      if ( ! ( obj instanceof BankAccount ) || ! ((Account) obj).getIsDefault() ) {
        return getDelegate().remove_(x, obj);
      }

      BankAccount account = (BankAccount) obj;
      setNewDefaultAccount(x, account);

      return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'setNewDefaultAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'currentDefaultAccount',
          type: 'net.nanopay.bank.BankAccount'
        }
      ],
      javaCode: `
      // set the current account to not default
      currentDefaultAccount.setIsDefault(false);

      List data  = ((ArraySink) getDelegate().inX(x)
      .where(
              AND(
                  INSTANCE_OF(BankAccount.class),
                  EQ(BankAccount.OWNER, currentDefaultAccount.getOwner()),
                  EQ(BankAccount.DENOMINATION, currentDefaultAccount.getDenomination()),
                  NEQ(BankAccount.ID, currentDefaultAccount.getId()),
                  EQ(BankAccount.ENABLED, true)
                )
            )
      .select(new ArraySink())).getArray();

      if ( data.size() != 0 ) {
        BankAccount newDefaultAccount = (BankAccount) ((FObject) data.get(0)).deepClone();
        newDefaultAccount.setIsDefault(true);
        getDelegate().put_(x, newDefaultAccount);
      }
      `
    }
  ]
});
