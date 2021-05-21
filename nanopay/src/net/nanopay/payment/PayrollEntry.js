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
  package: 'net.nanopay.payment',
  name: 'PayrollEntry',
  documentation: 'Payroll entry for a single payee',

  properties: [
    {
      class: 'String',
      name: 'email',
    },
    {
      class: 'String',
      name: 'firstName',
    },
    {
      class: 'String',
      name: 'lastName',
    },
    {
      class: 'String',
      name: 'institutionNo',
    },
    {
      class: 'String',
      name: 'branchId',
    },
    {
      class: 'String',
      name: 'bankAccountNo',
    },
    {
      class: 'String',
      name: 'dcaNo',
    },
    {
      class: 'String',
      name: 'transactionId',
    },
    {
      class: 'Double',
      name: 'amount'
    },
    {
      class: 'foam.core.Enum',
      name: 'status',
      of: 'net.nanopay.tx.model.TransactionStatus',
      value: 'COMPLETED'
    }
  ]
});
