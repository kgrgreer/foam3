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
  package: 'net.nanopay.partner.bepay.tx',
  name: 'BePayLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',
  documentation: 'Line item to carry information about the transaction details happening outside of nanopay',

  javaImports: [
    'foam.core.ValidationException'
  ],

  properties: [
    {
      class: 'Double',
      name: 'fxRate',
      documentation: 'rate BePay uses for BRL -> destination conversion'
    },
    {
      class: 'Double',
      name: 'fxSpread',
      documentation: 'the spread BePay applies'
    },
    {
      class: 'Double',
      name: 'effectiveRate',
      factory: function() {
        return this.fxSpread + this.fxRate;
      },
      javaFactory: 'return getFxSpread() + getFxRate();'
    },
    {
      class: 'Long',
      name: 'feeAmount',
      documentation: 'amount charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'feeCurrency',
      targetDAOKey: 'currencyDAO',
      documentation: 'currency of fee charged by partner'
    },
    {
      class: 'Long',
      name: 'IOF',
      documentation: 'tax charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'IOFCurrency',
      targetDAOKey: 'currencyDAO',
      documentation: 'currency of tax charged by partner'
    },
    {
      class: 'Double',
      name: 'IOFRate'
    },
    {
      class: 'Long',
      name: 'VETAmount'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'VETCurrency',
      targetDAOKey: 'currencyDAO',
      value: 'BRL'
    },
    {
      class: 'Long',
      name: 'feeAmount2',
      documentation: 'additional amount charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'feeCurrency2',
      targetDAOKey: 'currencyDAO'
    },
    {
      class: 'Long',
      name: 'discountAmount',
      documentation: 'discount given by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'discountCurrency',
      targetDAOKey: 'currencyDAO',
      documentation: 'currency of discount given by partner'
    },
    {
      class: 'String',
      name: 'discountCode'
    },
    {
      class: 'Long',
      name: 'IOF2'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'IOFCurrency2',
      targetDAOKey: 'currencyDAO'
    },
    {
      class: 'Double',
      name: 'IOFRate2'
    },
    {
      class: 'String',
      name: 'natureCode'
    }
  ],

  methods: [
    {
      name: 'validate',
      type: 'Void',
      javaCode: `
      if ( getFxRate() == 0 ) throw new ValidationException("fxRate is missing on BePayLineItem");

      if ( getFxSpread() == 0 ) throw new ValidationException("fxSpread is missing on BePayLineItem");

      if ( getFeeAmount() == 0 ) throw new ValidationException("feeAmount is missing on BePayLineItem");

      if ( getFeeCurrency() == "" ) throw new ValidationException("feeCurrency is missing on BePayLineItem");

      if ( getIOF() == 0 ) throw new ValidationException("IOF is missing on BePayLineItem");

      if ( getIOFRate() == 0 ) throw new ValidationException("IOFRate is missing on BePayLineItem");

      if ( getIOFCurrency() == "" ) throw new ValidationException("IOFCurrency is missing on BePayLineItem");

      if ( getVETAmount() == 0 ) throw new ValidationException("VET is missing on BePayLineItem");
      `
    }
  ]
});
