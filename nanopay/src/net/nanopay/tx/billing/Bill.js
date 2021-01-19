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
  package: 'net.nanopay.tx.billing',
  name: 'Bill',

  documentation: 'Bill object for Intuit Billing',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Reference',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode',
      of: 'net.nanopay.integration.ErrorCode',
      documentation: 'Error code associated to transaction error'
    },
    {
      class: 'FObjectArray',
      name: 'fees',
      of: 'net.nanopay.tx.billing.BillingFee'
    },
    {
      class: 'Reference',
      targetDAOKey: 'localTransactionDAO',
      name: 'originatingTransaction',
      of: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'Reference',
      targetDAOKey: 'localTransactionDAO',
      name: 'billingTransaction',
      of: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      name: 'statusHistory',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.HistoricStatus',
    }
  ]
});
