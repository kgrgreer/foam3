foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'LiquidTransactionLifecycleDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Transaction transaction = (Transaction) obj;
        if ( transaction.getLifecycleState() == LifecycleState.ACTIVE ) {
          return getDelegate().put_(x, obj);
        }
        return ((DAO) x.get("bareTransactionDAO")).inX(x).put(obj);
      `
    }
  ]
});
