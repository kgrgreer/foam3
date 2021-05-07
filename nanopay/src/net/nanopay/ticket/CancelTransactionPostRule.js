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
  name: 'CancelTransactionPostRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Post rule to cancel transaction',

  properties: [
    {
      class: 'Long',
      name: 'errorCode',
      value: 0
    }
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.ticket.RefundStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
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
          request.setRefundStatus(RefundStatus.PROCESSING);

          try {
            Transaction problemTxn = (Transaction) txnDAO.inX(x).find(request.getProblemTransaction()).fclone();
            if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) {
              problemTxn.setStatus(TransactionStatus.CANCELLED);
              if ( getErrorCode() != 0 )
                problemTxn.setErrorCode(getErrorCode());
              txnDAO.inX(x).put(problemTxn);
            }
            else {
              Object [] tobePaused = ((ArraySink) problemTxn.getChildren(x).select(new ArraySink())).getArray().toArray();
              if ( tobePaused.length > 0 ) {
                problemTxn = (Transaction) tobePaused[0];
                if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) {
                //TODO: we want full walk of children
                  problemTxn.setStatus(TransactionStatus.CANCELLED);
                  if ( getErrorCode() != 0 )
                    problemTxn.setErrorCode(getErrorCode());
                  txnDAO.inX(x).put(problemTxn);
                }
                else {
                  Logger logger = (Logger) x.get("logger");
                  logger.warning("CancelTransactionPostRule, running on ticket "+request.getId()+" No paused transaction to cancel. Rule ran but did nothing!");
                  request.setRefundStatus(RefundStatus.FAILED);
                }
              }
            }
          }
          catch (Exception e) {
          // transaction was not set to cancelled.
            Logger logger = (Logger) x.get("logger");
            logger.warning("CancelTransactionPostRule, running on ticket "+request.getId()+" encountered problem cancelling transaction: "+e);
            request.setRefundStatus(RefundStatus.FAILED);
          }
        }

      }, "Post Rule to Submit Problem Transaction Cancellation.");
      `
    }
  ]

});
