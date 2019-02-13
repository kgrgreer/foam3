foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayerTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Determine source account based on payer, when account is not provided.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.DigitalAccount',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger'
  ],

  imports: [
    'bareUserDAO'
  ],

  requires: [
    'foam.nanos.auth.User',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
       Logger logger = (Logger) x.get("logger");
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();
        logger.info("txn.findSourceAccount(x) " + txn.findSourceAccount(x));
        if ( txn.findSourceAccount(x) == null ) {
          User user = (User) ((DAO) x.get("bareUserDAO")).find_(x, txn.getPayerId());
          if ( user == null ) {
            throw new RuntimeException("Payer not found");
          } else {
            DigitalAccount digitalAccount = DigitalAccount.findDefault(getX(), user, txn.getSourceCurrency());
            txn = (Transaction) txn.fclone();
            txn.setSourceAccount(digitalAccount.getId());
            quote.setRequestTransaction(txn);
          }
        }
        return getDelegate().put_(x, quote);
`
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PayerTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
