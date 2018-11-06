foam.CLASS({
  package: 'net.nanopay.account',
  name: 'PreventSameCurrencyDigitalAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Checks digital account with same currency already exists, if so, prevents creating another',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*',

    'net.nanopay.account.DigitalAccount',

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
      javaReturns: 'foam.core.FObject',
      javaCode: `
      if ( ! ( obj instanceof DigitalAccount ) ) {
        return getDelegate().put_(x, obj);
      }
      DigitalAccount account = (DigitalAccount) obj;
      if ( getDelegate().find(account.getId()) == null ) {
        Count count = new Count();
        count = (Count) getDelegate()
          .where(
                 AND(
                     INSTANCE_OF(DigitalAccount.class),
                     EQ(DigitalAccount.OWNER, account.getOwner()),
                     EQ(DigitalAccount.DENOMINATION, account.getDenomination())
                     )
                 )
          .limit(1)
          .select(count);

      if ( count.getValue() > 0 ) throw new RuntimeException("A digital account with same currency: " + account.getDenomination() + " already exists.");

      }

      return super.put_(x, obj);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PreventSameCurrencyDigitalAccountDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
