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
  name: 'AFEXCreateTradeRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create trade on AFEX system when transaction is PENDING_PARENT_COMPLETED 
    and trade not yet created.`,

  javaImports: [
    'foam.blob.BlobService',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.InputStream',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.ConfirmationFileLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionLineItem',
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
          
          DAO transactionDAO = ((DAO) x.get("localTransactionDAO")).inX(x);
          AFEXTransaction transaction = (AFEXTransaction) obj.fclone();
          
          AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");
          if ( transaction.getAfexTradeResponseNumber() == 0 ) {  
            try {
              try {
                int result = afexService.createTrade(transaction);
                transaction.setAfexTradeResponseNumber(result);
                transaction = (AFEXTransaction) transactionDAO.put(transaction).fclone();
              } catch (Exception e) {
                if ( e.getMessage().contains("Quote has expired") && transaction.getSourceCurrency().equals(transaction.getDestinationCurrency())  ) {
                  // Quote most likely expired, get a new quote and try again
                  // same currency so there is no fx to worry about
                  long owner = transaction.findRootTransaction(x, transaction).findSourceAccount(x).getOwner();
                  FXQuote quote = afexService.getFXRate(transaction.getSourceCurrency(), transaction.getDestinationCurrency(), transaction.getAmount(), transaction.getDestinationAmount(), null, null, owner, null);
                  transaction.setFxQuoteId(String.valueOf(quote.getId()));
                  int result = afexService.createTrade(transaction);
                  transaction.setAfexTradeResponseNumber(result);
                  transaction = (AFEXTransaction) transactionDAO.put(transaction).fclone();
                } else {
                  throw e;
                }
              }
            } catch (Throwable t) {
              transaction = (AFEXTransaction) transaction.fclone();
              transaction.setStatus(TransactionStatus.DECLINED);
              transaction = (AFEXTransaction) transactionDAO.put(transaction);
              Transaction root = (Transaction) transaction.findRoot(x).fclone();
              root.setStatus(TransactionStatus.DECLINED);
              root = (Transaction) transactionDAO.put(root);
              String msg = "Error creating trade for AfexTransaction " + transaction.getId();
              logger.error(msg, t);
              Notification notification = new Notification.Builder(x)
                .setTemplate("NOC")
                .setBody(msg + " " + t.getMessage())
                .build();
                ((DAO) x.get("localNotificationDAO")).put(notification);
            }
          }
        }

      }, "Rule to create trade on AFEX system when transaction is PENDING_PARENT_COMPLETED and trade not yet created.");
      `
    }
  ]

});
