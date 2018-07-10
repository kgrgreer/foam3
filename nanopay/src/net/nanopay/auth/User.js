foam.CLASS({
  refines: 'foam.nanos.auth.User',

  requires: [
    'foam.dao.ArraySink'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'java.util.Iterator',
    'java.util.List'
  ],

  methods: [
    {
      documentation: `Support method to find a matching digital account, create if not found.`,
      name: 'getDigitalAccount',
      code: function(denomination) {
        var self = this;
        var currency = denomination || 'CAD';
        var dao = this.accounts;
        var digital = null;
        return dao.where(
          this.EQ(Account.DENOMINATION, currency)
        ).select_(x, this.ArraySink.create(), null, null, null, null)
          .then(function(sink) {
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
      },
      args: [
        {
          name: 'denomination',
          of: 'String'
        }
      ],
      javaReturns: 'net.nanopay.account.DigitalAccount',
      javaCode: `
          String currency = denomination;
          if ( currency == null ) {
            currency = "CAD";
          }
          DAO accountDAO = getAccounts();
          Sink accountSink = new ArraySink();
          accountDAO = accountDAO.where(
                                        EQ(Account.DENOMINATION, currency)
                                        );
          accountSink = accountDAO.select(accountSink);
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
            digital = (DigitalAccount) accountDAO.put(digital);
          }
          return digital;
`
    }
  ]
});
