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
  package: 'net.nanopay.invoice',
  name: 'InvoiceLineItem',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction'
    },
    {
      class: 'String',
      name: 'group',
      label: 'Type'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'UnitValue',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'currency',
      value: 'CAD'
    }
  ],

  methods: [
    function toSummary() {
      return this.description;
    }
  ]
});

