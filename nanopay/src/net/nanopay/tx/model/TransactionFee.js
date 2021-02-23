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
  package: 'net.nanopay.tx.model',
  name: 'TransactionFee',

  documentation: 'Holds Fee for Transactions.',

  tableColumns: [
    'id',
    'name',
    'transactionName',
    'transactionType',
    'denomination',
    'sourcePaysFees'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      required: true,
      documentation: 'Name to identify transaction fee.'
    },
    {
      class: 'String',
      name: 'transactionName',
      documentation: 'Describes which Transaction subclass fee should be applied to.'
    },
    {
      class: 'String',
      name: 'transactionType',
      documentation: 'Describes a Transaction class subclass fee should be applied to. All transactions which are an instanceOf this transactionClass'
    },
    {
      class: 'UnitValue',
      name: 'minAmount',
      documentation: 'Describes minimum amount this fee can be applied to.'
    },
    {
      class: 'UnitValue',
      name: 'maxAmount',
      documentation: 'Describes maximum amount this fee can be applied to.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'feeAccount'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.fee.Fee',
      name: 'fee',
      documentation: 'Fee class that should be applied to transaction.',
    },
    {
      class: 'String',
      name: 'denomination',
      value: 'CAD'
    },
    {
      name: 'sourcePaysFees',
      class: 'Boolean',
      hidden: true
    }
  ]
 });
