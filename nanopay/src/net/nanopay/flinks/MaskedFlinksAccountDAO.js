foam.CLASS({
  package: 'net.nanopay.flinks',
  name: 'MaskedFlinksAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for masking bank account data in Flinks
      AccountsDetail response.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.ProxySink',
    'foam.nanos.auth.AuthService',
    'net.nanopay.flinks.model.AccountWithDetailModel',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
  ],

  constants: [
    {
      type: 'String',
      name: 'UNMASK_ACCOUNT_NUMBER_PERMISSION',
      value: 'AccountWithDetailModel.unmask.AccountNumber'
    }
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if (sink != null && ! auth.check(x, UNMASK_ACCOUNT_NUMBER_PERMISSION)) {
          ProxySink maskedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              FObject masked = mask((FObject) obj);
              super.put(masked, sub);
            }
          };
          return super.select_(x, maskedSink.getDelegate(), skip, limit, order, predicate);
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'find_',
      javaCode:`
        FObject result = super.find_(x, id);
        AuthService auth = (AuthService) x.get("auth");

        if (result != null && ! auth.check(x, UNMASK_ACCOUNT_NUMBER_PERMISSION) ) {
          return mask(result);
        }
        return result;
      `
    },
    {
      name: 'mask',
      javaReturns: 'FlinksAccountsDetailResponse',
      args: [
        { of: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        FlinksAccountsDetailResponse result = (FlinksAccountsDetailResponse) obj.fclone();
        AccountWithDetailModel[] accounts = result.getAccounts();
        for (AccountWithDetailModel account : accounts) {
          String accountNumber = account.getAccountNumber();
          if (accountNumber != null) {
            String masked = maskedAccountNumber(accountNumber);
            account.setAccountNumber(masked);
          }
        }
        return result;
      `
    },
    {
      name: 'maskedAccountNumber',
      javaReturns: 'String',
      args: [
        { of: 'String', name: 'accountNumber' }
      ],
      javaCode: `
        int maskedLength = accountNumber.length() - 4;
        StringBuilder masked = sb.get();
        for (int i = 0; i < maskedLength; i++) {
          masked.append("*");
        }
        masked.append(accountNumber.substring(maskedLength));
        return masked.toString();
      `
    }
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected final ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
            @Override
            protected StringBuilder initialValue() {
              return new StringBuilder();
            }

            @Override
            public StringBuilder get() {
              StringBuilder b = super.get();
              b.setLength(0);
              return b;
            }
          };
        `);
      }
    }
  ]
});
