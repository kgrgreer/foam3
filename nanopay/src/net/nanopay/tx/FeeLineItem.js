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
      name: 'reversable',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'feeCurrency',
      targetDAOKey: 'currencyDAO',
      hidden: true,
      javaSetter: `
        feeCurrency_ = val;
        feeCurrencyIsSet_ = true;
        calculateView_();
      `
    },
    {
      name: 'amount',
      hidden: true,
      javaSetter: `
        amount_ = val;
        amountIsSet_ = true;
        calculateView_();
      `
    },
    {
      name: 'amountView',
      label: 'Amount',
      class: 'String'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Transfer',
      name: 'Transfers',
      networkTransient: true,
      hidden: true
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.fee.Rate',
      name: 'rates'
    }
  ],
  methods: [
    {
      name: 'calculateView_',
      javaCode: `
        DAO currDAO = (DAO) getX().get("currencyDAO");
        if (currDAO != null) {
          Currency cur = (Currency) currDAO.find(getFeeCurrency());
          if (cur != null ) {
            setAmountView(""+cur.format(getAmount()));
            return;
          }
        }
        setAmountView(""+getAmount());
      `
    }
  ]
});
