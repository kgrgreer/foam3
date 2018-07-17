foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayeeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',
  //extends: 'net.nanopay.tx.UserDestinationTransactionDAO',

  documentation: `Determine destination account based on payee, when account is not provided.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.DigitalAccount',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
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
          if ( obj.destinationAccount == null ) {
            var txn = obj;
            // if ( obj.frozen ) {
              txn = obj.fclone();
            // }
            this.localUserDAO.find(txn.payeeId).then(function(user) {
              user.findDigitalAccount(x, txn.sourceCurrency).then(function(account) {
                txn.destinationAccount = account.id;
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
        if ( txn.findDestinationAccount(x) == null ) {
          User user = (User) ((DAO) x.get("localUserDAO")).find(txn.getPayeeId());
          DigitalAccount digitalAccount = user.findDigitalAccount(x, txn.getSourceCurrency());
          txn = (Transaction) obj.fclone();
          txn.setDestinationAccount(digitalAccount.getId());
        }
        return getDelegate().put_(x, txn);
`
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PayeeTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
