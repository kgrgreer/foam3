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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'FeeLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports:[
    'foam.core.Currency',
    'foam.dao.DAO'
  ],

  properties: [
    {
      name: 'group',
      hidden: true
    },
    {
      name: 'type',
      hidden: true
    },
    {
      name: 'note',
      hidden: true
    },
    {
      name: 'name',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'feeCurrency',
      targetDAOKey: 'currencyDAO',
      hidden: true
    },
    {
      name: 'amount',
      order: 10,
      gridColumns: 6
    },
    {
      name: 'sourceAccount',
      label: 'Payer Account',
      order: 20,
      gridColumns: 6,
    },
    {
      name: 'destinationAccount',
      label: 'Fee Account',
      hidden: false,
      order: 30,
      gridColumns: 6
    },
    {
      name: 'feeId',
      class: 'Reference',
      of: 'net.nanopay.tx.fee.Fee',
      targetDAOKey: 'feeDAO',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.fee.Rate',
      name: 'rates',
      hidden: true
    }
  ]
});
