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
      class: 'String',
      name: 'requestTransaction',
      documentation: `Id of transaction requiring reversal`
    },
    {
      class: 'String',
      name: 'reversalTransaction',
      documentation: `Id of the reversal transaction`
    },
    {
      class: 'Boolean',
      name: 'refundTransaction',
      documentation: 'True to refundTransaction. False to retry transaction'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      name: 'lineitems',
    },
    {
      class: 'Enum',
      of: 'net.nanopay.ticket.RefundTypes',
      name: 'refundType'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.ticket.RefundStatus',
      name: 'refundStatus'
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
      }
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
      }
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
      }
    },
    {
      class: 'Boolean',
      name: 'refundFees'
    },
    {
      class: 'Boolean',
      name: 'chargeNewFees'
    }
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
