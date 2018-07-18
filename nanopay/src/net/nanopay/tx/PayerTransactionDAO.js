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
      code: function put_(x, obj) {
        return new Promise(function(resolve, reject) {
          if ( obj.sourceAccount == null ) {
            var txn = obj;
            // if ( obj.frozen ) {
              txn = obj.fclone();
            // }
            this.localUserDAO.find(txn.payerId).then(function(user) {
              user.findDigitalAccount(x, txn.sourceCurrency).then(function(account) {
                txn.sourceAccount = account.id;
                resolve(this.getDelegate.put_(x, txn));
              }).bind(this);
            }).bind(this);
          } else {
            resolve(this.getDelegate.put_(x, obj));
          }
        }.bind(this));
      },
      javaReturns: 'foam.core.FObject',
      javaCode: `
        Transaction txn = (Transaction) obj;
        if ( txn.findSourceAccount(x) == null ) {
          User user = (User) ((DAO) x.get("localUserDAO")).find(txn.getPayerId());
          DigitalAccount digitalAccount = user.findDigitalAccount(x, txn.getSourceCurrency());
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
