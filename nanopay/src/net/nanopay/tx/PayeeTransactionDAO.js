foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayeeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Determine destination account based on payee, when account is not provided. Also see PayerTransactionDAO`,

  requires: [
    'foam.dao.ArraySink'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'userDAO'
  ],

  javaImports: [
  'foam.nanos.auth.User',
  'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'net.nanopay.bank.BankAccount',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'java.util.Iterator',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      code: function put_(x, obj) {
        return new Promise(function(resolve, reject) {
          if ( obj.destinationAccount == null ) {
            var txn = obj;
            // if ( obj.frozen ) {
              txn = obj.fclone();
            // }
            this.digitalAccount(txn.payeeId, txn.destinationCurrency).then(function(account) {
              txn.destinationAccount = account;
              resolve(this.getDelegate.put_(x, txn));
            }).bind(this);
          } else {
            resolve(this.getDelegate.put_(x, obj));
          }
        }.bind(this));
      },
      javaReturns: 'foam.core.FObject',
      javaCode: `
        Transaction txn = (Transaction) obj;
        if ( txn.getDestinationAccount() == null ) {
          txn = (Transaction) obj.fclone();
          txn.setDestinationAccount(digitalAccount(txn.getPayeeId(), txn.getSourceCurrency(), x).getId());
        }
        return getDelegate().put_(x, txn);
`
    },
    {
      documentation: `Support method to find a matching digital account, create if not found.`,
      name: 'digitalAccount',
      returns: 'Promise',
      code: function(payeeId, denomination) {
        var self = this;
        var currency = denomination || 'CAD';
        return this.userDAO.find(payeeId).then(function(user) {
          var dao = user.accounts;
          dao.where(
            this.EQ(Account.DENOMINATION, currency)
          ).select_(x, this.ArraySink.create(), null, null, null, null)
            .then(function(sink) {
              var digital = null;
              sink.array.forEach(function(a) {
                if ( a instanceof DigitalAccount ) {
                  digital = a;
                }
              });
              if ( digital == null ) {
                digital = self.DigitalAccount.create();
                digital.denomination = currency;
                dao.put(digital).then(function(result) {
                  return result;
                });
              } else {
                return digital;
              }
            });
        }.bind(this));
      },
      args: [
        {
          name: 'userId',
          of: 'Long'
        },
        {
          name: 'denomination',
          of: 'String'
        },
        {
          name: 'x',
          of: 'foam.core.X'
        }
      ],
      javaReturns: 'net.nanopay.account.DigitalAccount',
      javaCode: `
          String currency = denomination;
          if ( currency == null || currency == "" ) {
            currency = "CAD";
          }
          DAO userDAO = (DAO) x.get("userDAO");
          User user = (User) userDAO.find_(x,userId);
          DAO accountDAO = user.getAccounts();
          Sink accountSink = new ArraySink();
          accountDAO = ((DAO)x.get("localAccountDAO")).where(AND(
                                                      EQ(Account.DENOMINATION, currency),
                          EQ(Account.OWNER, user.getId()),
                          EQ(BankAccount.IS_BANK_ACCOUNT, true)
                                                      ));
          accountSink = accountDAO.select_(x, accountSink, 0, 0,null,null);
          List<Account> accounts = ((ArraySink) accountSink).getArray();
          DigitalAccount digital = null;
          Iterator i = accounts.iterator();
          while ( i.hasNext() ) {
            Account account = (Account) i.next();
            if ( account instanceof DigitalAccount &&
                 denomination.equals(account.getDenomination()) ) {
              digital = (DigitalAccount) account;
            }
          }
          if ( digital == null ) {
            digital = new DigitalAccount();
            digital.setDenomination(currency);
            digital.setOwner(user.getId());
            digital = (DigitalAccount) accountDAO.put(digital);
          }
          return digital;
`
    }
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PayeeTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
