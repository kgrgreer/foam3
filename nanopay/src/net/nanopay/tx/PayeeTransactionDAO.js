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
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'bareUserDAO'
  ],

  requires: [
    'foam.nanos.auth.User'
  ],

  implements: [
    'foam.mlang.Expressions'
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
      javaReturns: 'foam.core.FObject',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();
        logger.info("txn.findSourceAccount(x) " + txn.findSourceAccount(x));
        Account account = (Account) txn.findDestinationAccount(x);
        if ( account == null ) {
          User user = (User) ((DAO) x.get("bareUserDAO")).find_(x, txn.getPayeeId());
          if ( user == null ) {
            throw new RuntimeException("Payee not found");
          }
          DigitalAccount digitalAccount = DigitalAccount.findDefault(getX(), user, txn.getDestinationCurrency());
          txn = (Transaction) txn.fclone();
          txn.setDestinationAccount(digitalAccount.getId());
          quote.setRequestTransaction(txn);
          return getDelegate().put_(x, quote);
        }
        txn.setDestinationCurrency(account.getDenomination());
        quote.setRequestTransaction(txn);
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
