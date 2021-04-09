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
  name: 'BasicRetryTicketRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create a retry transaction. tries to send the current funds to the summary destination again`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
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
    'net.nanopay.tx.model.TransactionStatus'
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
      name: 'creditAccount',
      documentation: 'The default credit account to be used in this scenario'
      // add validator make sure not empty
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        RefundTicket ticket = (RefundTicket) obj;
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        ticket.setCreditAccount(getCreditAccount());
        Transaction summary = (Transaction) txnDAO.find(ticket.getProblemTransaction());
        if (! (summary instanceof SummarizingTransaction ) ) {
          summary = summary.findRoot(x);
        }
        Transaction problem = summary.getStateTxn(x);

        agency.submit(x, agencyX -> {
          Transaction problemClone = (Transaction) problem.fclone();
          ticket.setProblemTransaction(problem.getId());
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

        Transaction newRequest = new Transaction();
        newRequest.setAmount(problem.getAmount());
        newRequest.setDestinationAccount(summary.getDestinationAccount());
        newRequest.setSourceAccount(problem.getSourceAccount());
        newRequest.setSourceCurrency(problem.getSourceCurrency());
        newRequest.setDestinationCurrency(summary.getDestinationCurrency());

        if ( ! SafetyUtil.isEmpty(getErrorCode()) ) {
          // TODO: look up error code fee. and create a fee line item for this.
        }

        ticket.setRequestTransaction(newRequest);
        ticket.setAgentInstructions(getTextToAgent() + " The proposed transaction will move "+newRequest.getAmount()+
        " from account "+newRequest.getSourceAccount()+" to Account "+newRequest.getDestinationAccount());


        // send back to agent for fee/credit entering and approval.
        // scenario has crafted the request transaction.
        // agent presses. approve. then we hit PostRule.
        // refund rule does a plan with the specified request transaction to the txn Dao for immidiete execution.
        // transaction is put.. this updates the ticket.
      `
    }
  ]

});
