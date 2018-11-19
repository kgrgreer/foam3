foam.CLASS({
  package: 'net.nanopay.account',
  name: 'PreventRemoveAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Checks if digital account has any transactions, if so, prevents account removal',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'remove_',
      javaCode: `
    Account account = (Account) obj;

    Count count = new Count();
    long total;
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    total = ((Count) transactionDAO.where(AND(
      EQ(Transaction.SOURCE_ACCOUNT, account.getId()),
      NOT(INSTANCE_OF(net.nanopay.tx.cico.VerificationTransaction.class))
    )).limit(1).select(count)).getValue();

    if ( total == 0 )
      total += ((Count) transactionDAO.where(AND(
        EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
        NOT(INSTANCE_OF(net.nanopay.tx.cico.VerificationTransaction.class))
      )).limit(1).select(count)).getValue();

    if ( total > 0 ) {
      throw new RuntimeException("Cannot delete account that has transactions");
    }
    return super.remove_(x, obj);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PreventRemoveAccountDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
