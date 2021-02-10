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
    'foam.dao.DAO',
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
        ticket.setTextToAgent(getTextToAgent());

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
