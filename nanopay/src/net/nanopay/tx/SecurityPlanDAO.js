foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SecurityPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Plans Security transactions',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.util.SafetyUtil',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.tx.Transfer',
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
    public SecurityPlanDAO(X x, DAO delegate) {
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
    DAO d = ((DAO) x.get("securityPlannerDAO"));
    quote = (TransactionQuote) d.put(quote);
    if ( quote.getPlan() != null )
      return quote;
    return super.put_(x, quote);
    `
    }
  ]
});

