foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'TransactionPlannerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Plans transactions',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
      public TransactionPlannerDAO(X x, DAO delegate) {
      setX(x);
      setDelegate(delegate);
      System.err.println("Direct constructor use is deprecated. Use Builder instead.");
    }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    TransactionQuote quote = (TransactionQuote) obj;
    DAO d = ((DAO) x.get("localTransactionPlannerDAO"));
    quote = (TransactionQuote) d.put(quote);
    if ( quote.getPlan() != null )
      return quote;
    return super.put_(x, quote);
    `
    }
  ]
});

