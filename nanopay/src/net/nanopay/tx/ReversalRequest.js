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
  package: 'net.nanopay.tx',
  name: 'ReversalRequest',

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
      class: 'Boolean',
      name: 'refundTransaction',
      documentation: 'True to refundTransaction. False to retry transaction'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'plans',
      javaValue: 'new Transaction[] {}'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionLineItem',
      name: 'lineitems',
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
