/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.ticket',
  name: 'RetryTransactionPostRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Post rule to update transaction',

  javaImports: [
    'foam.core.ClientRuntimeException',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList',
    'java.util.UUID'
  ],

  properties: [
    {
      class: 'Long',
      name: 'errorCode',
      value: 0
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          
          RefundTicket request = (RefundTicket) obj;
          DAO txnDAO = (DAO) x.get("localTransactionDAO");
          ArrayList<String> array = new ArrayList<String>();
          Transaction problemTransaction = request.findProblemTransaction(x);

          request.setRefundStatus(RefundStatus.PROCESSING);
          try {
            // Cancel paused transaction
            Transaction problemTxn = (Transaction) txnDAO.inX(x).find(request.getProblemTransaction()).fclone();
            if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) {
              if ( ! ( problemTxn instanceof DigitalTransaction ) ) {
                problemTxn.setStatus(problemTxn.getLastStatus());
                txnDAO.inX(x).put(problemTxn);
              }
              problemTxn.setStatus(TransactionStatus.CANCELLED);
              problemTxn.setErrorCode(getErrorCode());
              txnDAO.inX(x).put(problemTxn);
            } else {
              Object [] tobePaused = ((ArraySink) problemTxn.getChildren(x).select(new ArraySink())).getArray().toArray();
              if ( tobePaused.length > 0 ) {
              //TODO: iterate through all children.
                problemTxn = (Transaction) tobePaused[0];
                if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) { // do we want 1 level checking or full walk?
                  problemTxn.setStatus(TransactionStatus.CANCELLED);
                  problemTxn.setErrorCode(getErrorCode());
                  txnDAO.inX(x).put(problemTxn);
                }
                else {
                  Logger logger = (Logger) x.get("logger");
                  logger.warning("RefundTransactionPostRule, running on ticket "+request.getId()+" No paused transaction to cancel. Rule ran but did not cancel old transaction!");
                  request.setRefundStatus(RefundStatus.FAILED);
                }
              }
            }

            // Retry problemTransaction
            Transaction retry = new Transaction();
            retry.setDestinationAccount(request.getRetryAccount());
            retry.setSourceAccount(problemTransaction.getSourceAccount());
            retry.setSourceCurrency(problemTransaction.getSourceCurrency());
            retry.setDestinationCurrency(problemTransaction.getDestinationCurrency());
            retry.setAmount(-problemTransaction.getTotal(x, problemTransaction.getSourceAccount()));
            retry.setDestinationAmount(problemTransaction.getTotal(x, problemTransaction.getDestinationAccount()));
            retry.setPayeeId(problemTransaction.findSourceAccount(x).getOwner());
            retry.setPayerId(problemTransaction.findDestinationAccount(x).getOwner());


            TransactionQuote quote = new TransactionQuote();
            DAO transactionPlannerDAO = (DAO) x.get("localTransactionPlannerDAO");
            quote.setRequestTransaction(retry);
            quote = (TransactionQuote) transactionPlannerDAO.put(quote);
            
            retry = quote.getPlan();
            retry = (Transaction) txnDAO.put(retry);
            // create ticket txn and inject, and add this to child
            retry.setExternalId(problemTxn.getExternalId());
            retry.setExternalInvoiceId(problemTxn.getExternalInvoiceId());
            retry.setAssociateTransaction(problemTxn.getId());
            txnDAO.put(retry);
          }
          catch(Exception e) {
            Logger logger = (Logger) x.get("logger");
            logger.warning("RefundTransactionPostRule, running on ticket "+request.getId()+" encountered problem refunding transaction: "+e);
            request.setRefundStatus(RefundStatus.FAILED);
          }

        }
     
      }, "Post Rule to retry the problem transaction.");
      `
    }
  ]

});
