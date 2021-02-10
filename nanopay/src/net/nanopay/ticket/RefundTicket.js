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
  name: 'RefundTicket',
  extends: 'foam.nanos.ticket.Ticket',

  documentation: `Transaction reversal request`,

  requires: [
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.FeeLineItem'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      section: 'infoSection',
      order: 1,
      tableWidth: 100
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.TicketStatus',
      name: 'status',
      value: 'OPEN',
      javaFactory: 'return "OPEN";',
      includeInDigest: true,
      section: 'infoSection',
      order: 3,
      tableWidth: 130,
      createVisibility: 'HIDDEN',
      tableCellFormatter: function(value, obj) {
        obj.ticketStatusDAO.find(value).then(function(status) {
          if (status) {
            this.add(status.label);
          }
        }.bind(this));
      },
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReferenceView',
            of: 'foam.nanos.ticket.TicketStatus'
          },
          writeView: {
            class: 'foam.u2.view.ChoiceView',
            choices: x.data.statusChoices
          }
        };
      },
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'requestTransaction',
      documentation: `Id of transaction requiring reversal`,
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'refundTransaction',
      documentation: `Id of the reversal transaction`,
      createVisibility: 'HIDDEN',
      section: 'infoSection'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.ticket.RefundStatus',
      name: 'refundStatus',
      section: 'infoSection'
    },
    {
      class: 'Boolean',
      name: 'refundOldFees'
    },
    {
      class: 'Boolean',
      name: 'waiveFees'
    },
    {
      class: 'String',
      name: 'textToAgent'
    },
    {
      class: 'Long',
      name: 'creditAmount'
    }
  ]
});
