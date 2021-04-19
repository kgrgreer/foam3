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
  name: 'ScenarioAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Basic Scenario Action sets up the ticket, pauses transaction and does nothing else`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'foam.nanos.logger.Logger',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.util.SafetyUtil',
  ],

  properties: [
    {
      class: 'String',
      name: 'textToAgent',
      documentation: 'Text to display to agent'
    },
    {
      class: 'String',
      name: 'postApprovalRuleId',
      visibility: 'HIDDEN',
      networkTransient: true
    },
    {
      class: 'Boolean',
      name: 'autoApprove',
      visibility: 'HIDDEN',
      value: false,
      networkTransient: true
    },
    {
      class: 'Boolean',
      name: 'pauseProblem',
      visibility: 'HIDDEN',
      value: true,
      networkTransient: true
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        RefundTicket ticket = (RefundTicket) obj;

        // Task 1. Set up Ticket.
        ticket = setUpTicket(x, ticket);

        // Task 2. Maybe Pause Txn.
        if ( getPauseProblem() ) {
          final RefundTicket ticket2 = ticket;
          agency.submit(x, agencyX -> {
            pauseTransaction(agencyX, ticket2);
          }, "Pause Transaction from Scenario");
        }

        // Task 3. Remediate Problem.
        remediate(x, ticket);
      `
    },
    {
      name: 'setUpTicket',
      args: [
        { name: 'x', type: 'Context'},
        { name: 'ticket', type: 'net.nanopay.ticket.RefundTicket'}
      ],
      type: 'net.nanopay.ticket.RefundTicket',
      documentation: 'Sets up the ticket based on the scenario',
      javaCode: `
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        Transaction problem = (Transaction) txnDAO.find(ticket.getProblemTransaction());
        Transaction summary = problem.findRoot(x);
        problem = summary.getStateTxn(x); // gets the currently executing txn

        ticket.setProblemTransaction(problem.getId());
        ticket.setRefundTransaction(summary.getId());

        ticket.setAgentInstructions(getTextToAgent());
        ticket.setPostApprovalRuleId(getPostApprovalRuleId());
        ticket.setAutoApprove(getAutoApprove());

        return ticket;
      `
    },
    {
      name: 'pauseTransaction',
      args: [
        { name: 'x', type: 'Context'},
        { name: 'ticket', type: 'net.nanopay.ticket.RefundTicket'}
      ],
      documentation: 'Pause the current transaction Chain if possible',
      javaCode: `
        DAO txnDAO = (DAO) x.get("localTransactionDAO");

        Transaction problemClone = (Transaction) txnDAO.find(ticket.getProblemTransaction()).fclone();

        try {
          problemClone.setStatus(TransactionStatus.PAUSED);
          txnDAO.put(problemClone);
        }
        catch ( Exception e ) {
          try {
            List children = ((ArraySink) problemClone.getChildren(x).select(new ArraySink())).getArray();
            for ( Object t : children) {
              t = (Transaction) ((Transaction) t).fclone();
              ((Transaction) t).setStatus(TransactionStatus.PAUSED);
              txnDAO.put((Transaction) t);
            }
          }
          catch ( Exception e2 ) {
            Logger logger = (Logger) x.get("logger");
            logger.error("we failed to pause the Transaction "+problemClone.getId());
          }
        }

      `
    },
    {
      name: 'remediate',
      args: [
        { name: 'x', type: 'Context'},
        { name: 'ticket', type: 'net.nanopay.ticket.RefundTicket'}
      ],
      documentation: 'The part of the action which fixes the problem',
      javaCode: `
        //NOP
      `
    },

  ]

});
