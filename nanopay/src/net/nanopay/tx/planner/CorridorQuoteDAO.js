foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'CorridorQuoteDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    add corridors to the quote.
  `,

  javaImports: [
    'net.nanopay.tx.TransactionQuote',
    'foam.dao.DAO',
    'net.nanopay.payment.CorridorService',
    'net.nanopay.payment.PaymentProviderCorridorJunction',
    'java.util.List',
    'java.util.ArrayList',
  ],

  implements: [
    'foam.nanos.auth.EnabledAware',
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `

        TransactionQuote quote = (TransactionQuote) obj;
        if ( ! getEnabled() ) {
          return getDelegate().put_(x, obj);
        }
        quote.setCorridorsEnabled(true);
        CorridorService cs = (CorridorService) x.get("corridorService");

        // get list of payment providers
        List junctions = cs.getQuoteCorridorPaymentProviders(x, quote);

        for ( Object j : junctions )
          quote.getEligibleProviders().put(((PaymentProviderCorridorJunction) j).getSourceId(), true);

        return getDelegate().put_(x, quote);

      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CorridorQuoteDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
