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
  name: 'ReversalRule',

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
    'net.nanopay.ticket.ReversalTicket',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
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
          
          ReversalTicket request = (ReversalTicket) obj;
          DAO txnDAO = (DAO) x.get("localTransactionDAO");
          Transaction txn = (Transaction) txnDAO.find(request.getRequestTransaction());
          Transaction newTxn = new Transaction();

          if (! (txn instanceof SummaryTransaction || txn instanceof FXSummaryTransaction) ) {
            txn = txn.findRoot(x);
          }

          Transaction problemTxn = txn.getStateTxn(x);
          problemTxn = (Transaction) problemTxn.fclone();

          if ( request.getRefundType() == RefundTypes.MANUAL ) {
            newTxn.setSourceAccount(request.getSourceAccount());
            newTxn.setDestinationAccount(request.getDestinationAccount());
            newTxn.setAmount(request.getAmount());
          } else {
            newTxn.setSourceAccount(problemTxn.getSourceAccount());
            newTxn.setDestinationAccount(txn.getSourceAccount());
            newTxn.setAmount(txn.getAmount());
            newTxn.setLineItems(request.getLineitems());
          }

          problemTxn.setStatus(TransactionStatus.CANCELLED);
          txnDAO.put(problemTxn);
          txnDAO.put(newTxn);

        }
     
      }, "Rule to reverse transaction.");
      `
    }
  ]

});
