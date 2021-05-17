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
  name: 'CreateTicketRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Rule to create a ticket for a failed or declined transaction',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.mlang.predicate.And',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.Arrays',
    'java.util.ArrayList',
    'net.nanopay.tx.billing.ErrorFee',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

      agency.submit(x, agencyX -> {
        if ( ((Transaction) obj).getStatus() == ((Transaction) oldObj).getStatus() ) {
          return;
        }

        DAO ticketDAO = (DAO) agencyX.get("ticketDAO");
        ArraySink arraySink = new ArraySink();
        
        ticketDAO.where(MLang.AND(
          MLang.INSTANCE_OF(RefundTicket.class),
          MLang.EQ(RefundTicket.PROBLEM_TRANSACTION, ((Transaction) obj).getId())
        )).select(arraySink);
        List array = arraySink.getArray();

        if ( array.size() == 0 ) {
          RefundTicket ticket = new RefundTicket();
          ticket.setProblemTransaction(((Transaction) obj).getId());
          ticket.setSpid(((Transaction) obj).getSpid());
          ticket.setTitle("Failure Notification for " + ((Transaction) obj).getId());
          ticketDAO.put(ticket);
        } else {
          RefundTicket ticket = (RefundTicket) array.get(0);
          ticket.clearPostApprovalRuleId();
          ticket.clearFeeLineItemsSelected();
          ticket.clearSelectedFeeLineItemsIsValid();
          ticket.clearWaiveCharges();
          ticket.setRefundStatus(RefundStatus.AVAILABLE);
          ticketDAO.put(ticket);
        }
      }, "create a ticket on a declined or failed transaction");
      `
    }
  ]

});
