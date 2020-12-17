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
  name: 'InvoicedFeeLineItem',
  extends: 'net.nanopay.tx.FeeLineItem',

  documentation: 'A Fee LineItem whereby the fee collection occurs after the Transaction during some billing period. ',

  messages: [
      { name: 'DESCRIPTION', message: 'Invoice Fee' },
      { name: 'NOTE_MESSAGE', message: 'Fee will be charged at the end of billing period.' },
  ],

  properties: [
    {
      name: 'note',
      value: this.NOTE_MESSAGE,
      factory: function() {
        return this.NOTE_MESSAGE;
      }
    },

  ],

  methods: [
    function toSummary() {
      return this.DESCRIPTION;
    }
  ]
});
