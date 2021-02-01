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
      targetDAOKey: 'transactionDAO',
      name: 'originatingTransaction',
      of: 'net.nanopay.tx.model.Transaction'
    },
    {
      class: 'Reference',
      targetDAOKey: 'userDAO',
      name: 'chargeToUser',
      of: 'foam.nanos.auth.User',
      documentation: 'User paying the fee'
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessDAO',
      name: 'chargeToBusiness',
      of: 'net.nanopay.model.Business',
      documentation: 'Business paying the fee'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.ChargedTo',
      name: 'chargedTo',
      documentation: 'Determines if Payer or Payee is charged the fee'
    },
    {
      class: 'Date',
      name: 'chargeDate',
      documentation: 'Calculated date of when the fees will be charged'
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
    }
  ]
});
