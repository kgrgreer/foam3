/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'NoPendingTransactionsRule',

  documentation: `Validator that checks if account has any Pending transactions.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.LifecycleState',
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
                EQ(Transaction.SOURCE_ACCOUNT, digitalAccount.getId()),
                OR(
                  EQ(Transaction.LIFECYCLE_STATE, LifecycleState.PENDING),
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
