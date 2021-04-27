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
  package: 'net.nanopay.fx',
  name: 'FXLineItem',
  extends: 'net.nanopay.tx.ExpiryLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'foam.core.Currency',
    'foam.dao.DAO'
  ],

  properties: [
    {
      name: 'rate',
      class: 'Double',
      hidden: true,
      javaSetter: `
        rate_ = val;
        rateIsSet_ = true;
        calculateView_();
        calculateInverseRateView_();
      `
    },
    {
      name: 'rateView',
      label: 'Rate',
      class: 'String'
    },
    {
      name: 'inverseRateView',
      label: 'Inverse Rate',
      class: 'String'
    },
    {
      name: 'accepted',
      class: 'Boolean',
      value: false,
      hidden: true
    },
    {
      // can we use id for this.
      name: 'quoteId', // or fxQuoteCode
      class: 'String',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'sourceCurrency',
      targetDAOKey: 'currencyDAO',
      hidden: true,
      javaSetter: `
        sourceCurrency_ = val;
        sourceCurrencyIsSet_ = true;
        calculateView_();
      `
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'destinationCurrency',
      targetDAOKey: 'currencyDAO',
      hidden: true,
      javaSetter: `
        destinationCurrency_ = val;
        destinationCurrencyIsSet_ = true;
        calculateView_();
      `
    },
    // destinationAmount ?
  ],

  messages: [
      { name: 'DESCRIPTION', message: 'Foreign Exchange Information' },
  ],

  methods: [
    {
      name: 'calculateView_',
      javaCode: `
        DAO currDAO = (DAO) getX().get("currencyDAO");
        if ( currDAO != null ) {
          Currency src = (Currency) currDAO.find(getSourceCurrency());
          Currency dst = (Currency) currDAO.find(getDestinationCurrency());
          // format both sides of ':' to 1 of major unit of source currency.
          if ( src != null && dst != null ) {
            setRateView(src.format((long) Math.pow(10, src.getPrecision())) + " : " + dst.format((long) (getRate() * Math.pow(10, src.getPrecision()))));
            return;
          }
        }
        setRateView(""+getRate());
      `
    },
    {
      name: 'calculateInverseRateView_',
      javaCode: `
        DAO currDAO = (DAO) getX().get("currencyDAO");
        Double inverseRate = 1.0 / getRate();
        if ( currDAO != null ) {
          Currency src = (Currency) currDAO.find(getSourceCurrency());
          Currency dst = (Currency) currDAO.find(getDestinationCurrency());
          // format both sides of ':' to 1 of major unit of source currency.
          if ( src != null && dst != null ) {
            setInverseRateView(src.format((long) Math.pow(10, src.getPrecision())) + " : " + dst.format((long) (inverseRate * Math.pow(10, src.getPrecision()))));
            return;
          }
        }
        setInverseRateView(""+inverseRate);
      `
    },
    function toSummary() {
      return this.DESCRIPTION;
    }
  ]
});
