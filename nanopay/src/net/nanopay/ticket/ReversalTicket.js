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
  name: 'ReversalTicket',
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
      class: 'String',
      name: 'requestTransaction',
      documentation: `Id of transaction requiring reversal`,
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'reversalTransaction',
      documentation: `Id of the reversal transaction`,
      createVisibility: 'HIDDEN',
      section: 'infoSection'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      name: 'lineitems',
      section: 'infoSection'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.ticket.RefundTypes',
      name: 'refundType',
      section: 'infoSection'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.ticket.RefundStatus',
      name: 'refundStatus',
      section: 'infoSection'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourceAccount',
      readVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      createVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      section: 'infoSection'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationAccount',
      readVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      createVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      section: 'infoSection'
    },
    {
      class: 'Long',
      name: 'amount',
      readVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      createVisibility: function(refundType) {
        return refundType === net.nanopay.ticket.RefundTypes.MANUAL ?
          foam.u2.DisplayMode.RW :
          foam.u2.DisplayMode.HIDDEN;
      },
      section: 'infoSection'
    },
    {
      class: 'Boolean',
      name: 'refundFees',
      section: 'infoSection'
    },
    {
      class: 'Boolean',
      name: 'chargeNewFees',
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'comment',
      value: '',
      storageTransient: true,
      section: '_defaultSection',
      validationPredicates: [],
    },
  ],

  actions: [
    {
      name: 'addFee',
      label: 'Add FeeLineItem',
      code: function() {
        this.lineitems = this.lineitems.concat([new this.FeeLineItem.create()]);
      }
    },
    {
      name: 'addDiscount',
      label: 'Add DiscountLineItem',
      code: function() {
        this.lineitems = this.lineitems.concat([new this.CreditLineItem.create()]);
      }
    },
  ]
});
