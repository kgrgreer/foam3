foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayerTransactionDAO',
  extends: 'foam.dao.ProxyDAO',
  //extends: 'net.nanopay.tx.UserDestinationTransactionDAO',

  documentation: `Determine source account based on payer, when account is not provided.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.DigitalAccount',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.dao.DAO'
  ],

  imports: [
    'accountDAO'
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
            this.accountDAO.find(this.AND(this.EQ(this.DigitalAccount.OWNER, txn.payerId), this.EQ(this.DigitalAccount.DENOMINATION, txn.sourceCurrency))).then(function(account) {
              txn.sourceAccount = account;
              resolve(this.getDelegate.put_(x, txn));
            }).bind(this);
          } else {
            resolve(this.getDelegate.put_(x, obj));
          }
        }.bind(this));
      },
      javaReturns: 'foam.core.FObject',
      javaCode: `
        Transaction txn = (Transaction) obj;
        if ( txn.getSourceAccount() == null ) {
        DigitalAccount digitalAccount = (DigitalAccount) ((DAO)x.get("localAccountDAO")).find(AND(EQ(DigitalAccount.OWNER, txn.getPayerId()),EQ(DigitalAccount.DENOMINATION, txn.getSourceCurrency())));
          if ( digitalAccount == null ) {
            digitalAccount = new DigitalAccount();
            digitalAccount.setDenomination(txn.getSourceCurrency())  ;
            digitalAccount.setOwner(txn.getPayerId());
            ((DAO)x.get("localAccountDAO")).put_(x, digitalAccount );
          }
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
