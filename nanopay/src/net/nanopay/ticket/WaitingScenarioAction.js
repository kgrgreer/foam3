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
  name: 'WaitingScenarioAction',
  extends: 'net.nanopay.ticket.ScenarioAction',

  documentation: `Scenario Action to hold the ticket in a waiting status while a transaction progresses`,

  javaImports: [
    'net.nanopay.ticket.RefundStatus',
    'net.nanopay.ticket.RefundTicket'
  ],

  properties: [
    {
      class: 'String',
      name: 'postApprovalRuleId',
      value: 'waiting'
    }
  ],

  methods: [
  {
      name: 'setUpTicket',
      documentation: 'Puts the refund status into waiting',
      javaCode: `
        ticket = super.setUpTicket(x, ticket);
        ticket.setRefundStatus(RefundStatus.WAITING);
        return ticket;
      `
    }
  ]

});
