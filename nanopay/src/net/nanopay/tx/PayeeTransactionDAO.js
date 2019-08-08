foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayeeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Determine destination account based on payee when account is not provided.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();
        Account account = txn.findDestinationAccount(x);
        if ( account == null ) {
          User user = (User) ((DAO) x.get("bareUserDAO")).find_(x, txn.getPayeeId());
          if ( user == null ) {
            ((Logger) x.get("logger")).error("Payee not found for " + txn.getId());
            throw new RuntimeException("Payee not found");
          }
          account = DigitalAccount.findDefault(getX(), user, txn.getDestinationCurrency());
          txn.setDestinationAccount(account.getId());
          quote.setDestinationAccount(account);
          return getDelegate().put_(x, quote);
        }
        txn.setDestinationCurrency(account.getDenomination());
        quote.setDestinationAccount(account);
        return getDelegate().put_(x, quote);
      `
    },
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
