foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayerTransactionDAO',
  //extends: 'net.nanopay.tx.UserDestinationTransactionDAO',

  documentation: `Determine source account based on payer, when account is not provided.`,

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
            if ( obj.frozen ) {
              txn = obj.fclone();
            }
            this.digitalAccount(txn.payerId, txn.sourceCurrency).then(function(account) {
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
        Transaction txn = obj;
        if ( txn.getSourceAccount() == null ) {
          txn = (Transaction) obj.fclone();
          txn.setSourceAccount(digitalAccount(txn.getPayerId(), txn.getSourceCurrency()));
        }
        return getDelegate().put_(x, txn);
`
    },
  ]
});
