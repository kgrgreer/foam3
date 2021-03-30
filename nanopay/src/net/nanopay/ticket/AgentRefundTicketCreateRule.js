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
    'net.nanopay.tx.SummarizingTransaction',
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
    },
    {
      class: 'String',
      name: 'postApprovalRuleId',
      visibility: 'HIDDEN',
      networkTransient: true
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
 RefundTicket ticket = (RefundTicket) obj;
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        final Transaction summary;
        Transaction temp = (Transaction) txnDAO.find(ticket.getProblemTransaction());
        if (! (temp instanceof SummarizingTransaction ) ) {
          summary = temp.findRoot(x);
        } else {
          summary = temp;
        }
        Transaction problem = summary.getStateTxn(x);

        agency.submit(x, agencyX -> {
          Transaction problemClone = (Transaction) problem.fclone();
          ticket.setProblemTransaction(problem.getId());
          ticket.setRefundTransaction(summary.getId());
          ticket.setPostApprovalRuleId(getPostApprovalRuleId());
          DAO txnDAO2 = (DAO) agencyX.get("localTransactionDAO");
          try {
            problemClone.setStatus(TransactionStatus.PAUSED);
            txnDAO2.put(problemClone);
          }
          catch ( Exception e ) {
            try {
              List children = ((ArraySink) problem.getChildren(x).select(new ArraySink())).getArray();
              for ( Object t : children) {
                t = (Transaction) ((Transaction) t).fclone();
                ((Transaction) t).setStatus(TransactionStatus.PAUSED);
                txnDAO2.put((Transaction) t);
              }
            }
            catch ( Exception e2 ) {
              Logger logger = (Logger) x.get("logger");
              logger.error("we failed to pause the Transaction "+problem.getId());
            }
          }
        }, "Reput transaction as paused");

        ticket.setAgentInstructions(getTextToAgent());

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
