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
  name: 'AFEXSubmitPaymentRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create submit payment to AFEX system when transaction is PENDING
    and reference number is null.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'java.text.DateFormat',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'java.util.Locale',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {

          Logger logger = (Logger) x.get("logger");
          if ( ! (obj instanceof AFEXTransaction) ) {
            return;
          }

          AFEXTransaction transaction = (AFEXTransaction) obj;
          AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");

          if (transaction.getStatus() == TransactionStatus.PENDING
            && SafetyUtil.isEmpty( transaction.getExternalInvoiceId() ) ) {

              try {
                Transaction txn = afexService.submitPayment(transaction);
                if ( ! SafetyUtil.isEmpty(txn.getExternalInvoiceId()) ) {
                  transaction.setStatus(TransactionStatus.SENT);
                  transaction.setExternalInvoiceId(txn.getExternalInvoiceId());
                  transaction.setCompletionDate(txn.getCompletionDate());
                } else {
                  transaction.setStatus(TransactionStatus.DECLINED);
                  logger.error("Error submitting payment to AFEX.");
                }
                // update transaction
                ((DAO) x.get("localTransactionDAO")).put_(x, transaction);
              } catch (Throwable t) {
                String msg = "Error submitting payment for AfexTransaction " + transaction.getId();
                logger.error(msg, t);
                transaction.setStatus(TransactionStatus.DECLINED);
                ((DAO) x.get("localTransactionDAO")).put_(x, transaction);

                Notification notification = new Notification.Builder(x)
                  .setTemplate("NOC")
                  .setBody(msg + " " + t.getMessage())
                  .build();
                  ((DAO) x.get("localNotificationDAO")).put(notification);
              }
          }
        }
      }, "Rule to create submit payment to AFEX system when transaction is PENDING and reference number is null.");
      `
    }
  ]

});
