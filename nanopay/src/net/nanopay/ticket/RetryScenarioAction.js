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
  name: 'RetryScenarioAction',
  extends: 'ScenarioAction',

  documentation: `Rule to create a retry transaction. tries to send the current funds to the summary destination again`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
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
      name: 'creditAccount',
      documentation: 'The default credit account to be used in this scenario'
      // add validator make sure not empty
    }
  ],

  methods: [
    {
      name: 'remediate',
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

      `
    }
  ]

});
