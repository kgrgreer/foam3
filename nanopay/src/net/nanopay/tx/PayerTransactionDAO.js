foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayerTransactionDAO',
  extends: 'foam.dao.ProxyDAO',
  //extends: 'net.nanopay.tx.UserDestinationTransactionDAO',

  documentation: `Determine source account based on payer, when account is not provided.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.DigitalAccount',
    'foam.dao.DAO',
    'foam.nanos.auth.User'
  ],

  imports: [
    'localUserDAO'
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
      x = x.put("accountDAO", x.get("localAccountDAO"));
        Transaction txn = (Transaction) obj;
        if ( txn.findSourceAccount(x) == null ) {
          User user = (User) ((DAO) x.get("localUserDAO")).find_(x,txn.getPayerId());
          if ( user == null ) {
                          throw new RuntimeException("Payer not found");
                        }
          DigitalAccount digitalAccount = DigitalAccount.findDefault(x, user, txn.getSourceCurrency());
          txn = (Transaction) obj.fclone();
          txn.setSourceAccount(digitalAccount.getId());
        }
        return getDelegate().put_(x, txn);
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
