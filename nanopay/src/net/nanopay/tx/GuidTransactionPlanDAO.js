foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'GuidTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Give each transaction an UID`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      obj = getDelegate().put_(x, obj);
      
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction[] txnArray = quote.getPlans();
      for ( int i=0; i<txnArray.length; i++ ) {
        txnArray[i] = guidForTransactions(x, txnArray[i]);
      }
      return quote;
      `
    },
    {
      name: 'guidForTransactions',
      javaType: 'Transaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
        type: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
      ],
      javaCode: `   
        transaction.setId(UUID.randomUUID().toString());
        if ( transaction.getNext() != null ) {
          for ( Transaction txn: transaction.getNext() ) {
            txn = guidForTransactions(x, txn);
          }
        }
        return transaction;
      `
    }
  ],
});
