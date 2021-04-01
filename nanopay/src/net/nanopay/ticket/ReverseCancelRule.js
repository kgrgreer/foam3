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
  package: 'net.nanopay.ticket',
  name: 'ReverseCancelRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to refund transaction`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'foam.dao.ArraySink',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.ticket.RefundStatus',
    'net.nanopay.tx.creditengine.FeeRefund',
    'net.nanopay.tx.creditengine.AllFeeWaiver',
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.InvoicedCreditLineItem',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.EQ'
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
          DAO creditCodeDAO = (DAO) x.get("creditCodeDAO");

          Transaction reverse = request.getRequestTransaction();

          Transaction problemTxn = (Transaction) txnDAO.inX(x).find(request.getProblemTransaction()).fclone();
          ArrayList<String> array = new ArrayList<String>();

          Transaction summary = problemTxn.findRoot(x);


          try {
            problemTxn = (Transaction) problemTxn.fclone();
            if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) {
              problemTxn.setStatus(TransactionStatus.CANCELLED);
              txnDAO.inX(x).put(problemTxn);
            }
            else {
              problemTxn = (Transaction) ((ArraySink) problemTxn.getChildren(x).select(new ArraySink())).getArray().toArray()[0];
              if ( problemTxn.getStatus() == TransactionStatus.PAUSED ) {
                problemTxn.setStatus(TransactionStatus.CANCELLED);
                txnDAO.inX(x).put(problemTxn);
              }
            }
          }
          catch (Exception e) {
          // transaction was not set to cancelled.
          // if declined
          }
          txnDAO.inX(x).put(reverse);

          request.setRefundStatus(RefundStatus.PROCESSING);
        }

      }, "Rule to submit Cancelation.");
      `
    }
  ]

});
