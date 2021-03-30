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
  package: 'net.nanopay.partner.intuit.tx',
  name: 'IntuitTransactionSummary',
  extends: 'net.nanopay.tx.TransactionSummary',

  tableColumns: [
    'summary',
    'category',
    'status',
    'externalId',
    'created',
    'errorCode'
  ],

  searchColumns: [
    'id',
    'summary',
    'amount',
    'status',
    'category',
    'errorCode',
    'created',
    'externalId',
    'externalInvoiceId'
  ],

  properties: [
    {
      class: 'String',
      name: 'externalId',
      section: 'transactionInformation',
      order: 130,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'externalInvoiceId',
      section: 'transactionInformation',
      order: 140,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      name: 'feeLineItem',
      of: 'net.nanopay.tx.FeeSummaryTransactionLineItem',
      section: 'transactionInformation',
      order: 150,
      gridColumns: 12
    }
  ]
});
