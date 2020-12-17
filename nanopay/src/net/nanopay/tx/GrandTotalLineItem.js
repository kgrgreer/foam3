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
  name: 'GrandTotalLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  messages: [
    { name: 'GRAND_TOTAL', message: 'Grand total' }
  ],

  properties: [
    {
      name: 'amount',
      label: 'Total',
      visibility: 'RO'
    }
  ],

  methods: [
    function toSummary() {
      return this.GRAND_TOTAL;
    }
  ]
});
