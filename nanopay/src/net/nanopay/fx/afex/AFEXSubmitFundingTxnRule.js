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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXSubmitFundingTxnRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to submit funding transaction on AFEX system when transaction is sent and balance is completed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXFundingTransaction',
    'net.nanopay.tx.TransactionEvent',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {

          Logger logger = (Logger) x.get("logger");
          DAO transactionDAO = ((DAO) x.get("localTransactionDAO")).inX(x);
          AFEXFundingTransaction transaction = (AFEXFundingTransaction) obj;
          AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");

          try {
            AFEXBeneficiary afexBeneficiary = afexService.createInstantBeneficiary(x,transaction);
            transaction.getTransactionEvents(x).put_(x, new TransactionEvent("Instant beneficiary created."));
          } catch (Throwable t) {
            String msg = "Error creating instant beneficiary " + transaction.getId();
            logger.error(msg, t);
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(msg + " " + t.getMessage())
              .build();
            ((DAO) x.get("localNotificationDAO")).put(notification);
            return;
          }

          try {
            AFEXFundingTransaction txn = afexService.submitInstantPayment(transaction);
            txn.getTransactionEvents(x).put_(x, new TransactionEvent("Instant payment submitted."));
            transactionDAO.put(txn);
          } catch (Throwable t) {
            String msg = "Error submitting AfexFundingTransaction " + transaction.getId();
            logger.error(msg, t);
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(msg + " " + t.getMessage())
              .build();
            ((DAO) x.get("localNotificationDAO")).put(notification);
          } 
        }
      }, "Rule to create submit transaction on AFEX system when transaction is pending and balance is completed.");
      `
    }
  ]

});
