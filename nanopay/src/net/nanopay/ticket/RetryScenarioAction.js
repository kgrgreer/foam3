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
  name: 'RetryScenarioAction',
  extends: 'net.nanopay.ticket.ScenarioAction',

  documentation: `Rule to create a retry transaction. tries to send the current funds to the summary destination again`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.SummarizingTransaction',
    'net.nanopay.tx.TransactionLineItem'
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

        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        Transaction problem = (Transaction) txnDAO.find(ticket.getProblemTransaction());
        Transaction summary = (Transaction) txnDAO.find(ticket.getRefundTransaction());
        ticket.setCreditAccount(getCreditAccount());

        Transaction newRequest = new Transaction();
        newRequest.setAmount(problem.getAmount());
        newRequest.setDestinationAccount(summary.getDestinationAccount());
        newRequest.setSourceAccount(problem.getSourceAccount());
        newRequest.setSourceCurrency(problem.getSourceCurrency());
        newRequest.setDestinationCurrency(summary.getDestinationCurrency());

        ticket.setRequestTransaction(newRequest);

      `
    }
  ]

});
