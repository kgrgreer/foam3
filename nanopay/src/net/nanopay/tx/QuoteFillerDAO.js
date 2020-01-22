foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'QuoteFillerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    pre load the quote with useful info. Liquid always knows source/destination accounts.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }
        Logger logger = (Logger) x.get("logger");
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();

        quote.setDestinationAccount((Account) txn.findDestinationAccount(getX())); // elevate destination account search to system.
        quote.setSourceAccount((Account) txn.findSourceAccount(x));

        if (quote.getSourceAccount() == null )
          throw new RuntimeException("Unable to access the source account.");
        if( quote.getDestinationAccount() instanceof net.nanopay.account.AggregateAccount )
          throw new RuntimeException("Unable to send funds to an aggregate account");
           if( quote.getSourceAccount() instanceof net.nanopay.account.AggregateAccount )
                    throw new RuntimeException("Unable to send funds from an aggregate account");
        if( quote.getDestinationAccount() instanceof net.nanopay.account.SecuritiesAccount && ! ( quote.getSourceAccount() instanceof net.nanopay.account.SecuritiesAccount ) )
          throw new RuntimeException("Unable to send between Securities and Cash");
        if( quote.getSourceAccount() instanceof net.nanopay.account.SecuritiesAccount && ! ( quote.getDestinationAccount() instanceof net.nanopay.account.SecuritiesAccount ) )
          throw new RuntimeException("Unable to send between Cash and Securities");

        if ( SafetyUtil.isEmpty(txn.getSourceCurrency()) ) {
          logger.log("Transaction Source Currency not specified, defaulting to source account denomination");
          txn.setSourceCurrency(quote.getSourceAccount().getDenomination());
        }
        if ( SafetyUtil.isEmpty(txn.getDestinationCurrency()) ) {
          logger.log("Transaction Source Currency not specified, defaulting to source account denomination");
          txn.setDestinationCurrency(quote.getDestinationAccount().getDenomination());
        }

        quote.setSourceUnit(txn.getSourceCurrency());
        quote.setDestinationUnit(txn.getDestinationCurrency());
        return getDelegate().put_(x, quote);
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public QuoteFillerDAO(foam.core.X x, foam.dao.DAO delegate) {
            System.err.println("Direct constructor use is deprecated. Use Builder instead.");
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
