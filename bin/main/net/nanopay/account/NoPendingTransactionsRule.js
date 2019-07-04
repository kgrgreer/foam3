foam.CLASS({
  package: 'net.nanopay.account',
  name: 'NoPendingTransactionsRule',

  documentation: `Validator that checks if account has any Pending transactions.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof DigitalAccount ) {
          Count count = new Count();
          DigitalAccount digitalAccount = (DigitalAccount) obj;
          count = (Count) ((DAO) x.get("localTransactionDAO"))
            .where(
              AND(
                OR(
                  EQ(Transaction.DESTINATION_ACCOUNT, digitalAccount.getId()),
                  EQ(Transaction.SOURCE_ACCOUNT, digitalAccount.getId())
                ),
                OR(
                  EQ(Transaction.STATUS, TransactionStatus.PENDING),
                  EQ(Transaction.STATUS, TransactionStatus.SCHEDULED),
                  EQ(Transaction.STATUS, TransactionStatus.PENDING_PARENT_COMPLETED)
                )
              )
            )
            .limit(1)
            .select(count);

          if ( count.getValue() > 0 ) {
            Logger logger = (Logger) x.get("logger");
            logger.log("Cannot delete account " + digitalAccount.getId() + " as there are still Pending or Scheduled Transactions");
            throw new  RuntimeException("Cannot delete this account as there are still Pending or Scheduled Transactions");
          }
        }
      `
    }
  ]
});
