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

  documentation: 'Post rule to cancel transaction',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.DigitalTransaction',
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
            Transaction retry = (Transaction) problemTransaction.fclone();
            retry.setStatus(TransactionStatus.PENDING);
            retry.setDestinationAccount(request.getRetryAccount());
            retry.setId(UUID.randomUUID().toString());
            retry.setParent(problemTransaction.getId());
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
