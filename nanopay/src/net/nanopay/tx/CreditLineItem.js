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

/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CreditLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',
  documentation: 'A line item for giving discounts/credits.',

  javaImports: [
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
      name: 'reversable',
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
      of: 'net.nanopay.tx.creditengine.CreditCodeAccount',
      name: 'creditCode',
      targetDAOKey: 'creditCodeDAO'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'creditCurrency',
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
      readPermissionRequired: true
    },
    {
      name: 'destinationAccount',
      label: 'credited Account',
      hidden: false,
      order: 30,
      gridColumns: 6,
      view: {
        class: 'foam.u2.view.ReferenceView'
      }
    }
  ]
});
