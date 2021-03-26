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
      documentation: `Transaction doing the reversal`,
      section: 'infoSection',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'refundTransaction',
      documentation: `Id of the transaction requiring reversal`,
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'creditAccount',
      documentation: `Id of the creditAccount`,
      section: 'infoSection'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'problemTransaction',
      documentation: `Id of the problem transaction`,
      createVisibility: function(problemTransaction) {
        return (problemTransaction == null) ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RO;
      },
      section: 'infoSection',
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.ticket.RefundStatus',
      name: 'refundStatus',
      section: 'infoSection'
    },
    {
      class: 'Boolean',
      name: 'waiveCharges'
    },
    {
      class: 'String',
      name: 'agentInstructions',
      readVisibility: 'RO',
      updateVisibility: 'RO'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.FeeLineItem',
      name: 'feeLineItemsAvaliable',
      visibility: 'HIDDEN'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.FeeLineItem',
      name: 'feeLineItemsSelected',
      view: function(_, X) { 
        if ( X.controllerMode === foam.u2.ControllerMode.EDIT ){
          return {
            class: 'foam.u2.view.MultiChoiceView',
            choices$: X.data.feeLineItemChoices$,
            isValidNumberOfChoices$: X.data.selectedFeeLineItemsIsValid$,
            showValidNumberOfChoicesHelper: false,
            minSelected: 0,
            maxSelected: X.data.feeLineItemChoices.length
          };
        }
        return {
          class: 'foam.u2.view.FObjectArrayView',
          of: net.nanopay.tx.FeeLineItem
        }
      },
      createVisibility: 'HIDDEN',
    },
    {
      class: 'Boolean',
      name: 'selectedFeeLineItemsIsValid',
      visibility: 'HIDDEN',
      value: false
    },
    {
      name: 'feeLineItemChoices',
      visibility: 'HIDDEN',
      expression: function(feeLineItemsAvaliable){
        return feeLineItemsAvaliable.map(feeLineItem => {
          // TODO: add condition if isFinal is implemented for fee line item
          var isFinal = false;

          return [feeLineItem, feeLineItem.toSummary(), isFinal]
        })
      }
    }
  ]
});
