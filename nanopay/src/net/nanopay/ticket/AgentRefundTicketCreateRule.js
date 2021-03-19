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
  name: 'AgentRefundTicketCreateRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to determine if the transaction can be refunded`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'foam.nanos.fs.File',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.util.SafetyUtil',
  ],

  properties: [
    {
      class: 'String',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'textToAgent',
      documentation: 'Description of the base resolution path'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        RefundTicket ticket = (RefundTicket) obj;
        ticket.setAgentInstructions(getTextToAgent());
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        Transaction summary = (Transaction) txnDAO.find(ticket.getProblemTransaction());
        if (! (summary instanceof SummaryTransaction || summary instanceof FXSummaryTransaction) ) {
          summary = summary.findRoot(x);
        }
        Transaction problem = summary.getStateTxn(x);
        ticket.setProblemTransaction(problem.getId());
        try {
          problem.setStatus(TransactionStatus.PAUSED);
          txnDAO.put(problem);
        }
        catch ( Exception e ) {
          try {
            List children = ((ArraySink) problem.getChildren(x).select(new ArraySink())).getArray();
            for ( Object t : children) {
              ((Transaction) t).setStatus(TransactionStatus.PAUSED);
              txnDAO.put((Transaction) t);
            }
          }
          catch ( Exception e2 ) {
            // add note on ticket that the transaction was not paused.
          }
        }

        if ( ! SafetyUtil.isEmpty(getErrorCode())) {
          // look up error code fee. and create a fee line item for this.
        }

        // send back to agent for fee/credit entering and approval.
        // scenario has crafted the request transaction.
        // agent presses. approve. then we hit refundRUle.
        // refund rule does a plan with the specified request transaction to the txn Dao for immidiete execution.
        // transaction is put.. this updates the ticket.
      `
    }
  ]

});
