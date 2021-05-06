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
  package: 'net.nanopay.country.br.tx',
  name: 'PartnerLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',
  documentation: 'Line item to carry information about the transaction details happening outside of nanopay',

  javaImports: [
    'foam.core.ValidationException'
  ],

  properties: [
    {
      class: 'Double',
      name: 'fxRate',
      documentation: 'rate partner uses for BRL -> destination conversion'
    },
    {
      class: 'Double',
      name: 'fxSpread',
      documentation: 'the spread partner applies'
    },
    {
      class: 'Double',
      name: 'effectiveRate',
      factory: function() {
        return this.fxSpread + this.fxRate + this.bankFeeRate;
      },
      javaFactory: 'return getFxSpread() + getFxRate() + getBankFeeRate();'
    },
    {
      class: 'UnitValue',
      name: 'IOF',
      unitPropName: 'IOFCurrency',
      documentation: 'tax charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'IOFCurrency',
      targetDAOKey: 'currencyDAO',
      label: 'IOF Currency',
      documentation: 'currency of tax charged by partner'
    },
    {
      class: 'Double',
      name: 'IOFRate',
      label: 'IOF Rate'
    },
    {
      class: 'UnitValue',
      name: 'IRS',
      unitPropName: 'IRSCurrency'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'IRSCurrency',
      label: 'IRS Currency',
      targetDAOKey: 'currencyDAO'
    },
    {
      class: 'Double',
      name: 'IRSRate',
      label: 'IRS Rate'
    },
    {
      class: 'Double',
      name: 'VET'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'VETCurrency',
      label: 'VET Currency',
      targetDAOKey: 'currencyDAO',
      value: 'BRL'
    },
    {
      class: 'UnitValue',
      name: 'transactionFee',
      label: 'Transaction Fee',
      unitPropName: 'transactionFeeCurrency',
      documentation: 'additional amount charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'transactionFeeCurrency',
      label: 'Transaction Fee Currency',
      targetDAOKey: 'currencyDAO'
    },
    {
      class: 'UnitValue',
      name: 'additionalFee',
      unitPropName: 'additionalFeeCurrency',
      documentation: 'amount charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'additionalFeeCurrency',
      targetDAOKey: 'currencyDAO',
      documentation: 'currency of fee charged by partner'
    },
    {
      class: 'UnitValue',
      name: 'discountAmount',
      unitPropName: 'discountCurrency',
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
      class: 'String',
      name: 'natureCode'
    },
    {
      class: 'UnitValue',
      name: 'bankFee',
      unitPropName: 'bankFeeCurrency'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'bankFeeCurrency',
      targetDAOKey: 'currencyDAO',
      label: 'Bank Fee Currency'
    },
    {
      class: 'Double',
      name: 'bankFeeRate',
      label: 'bank Rate'
    }
  ],

  methods: [
    {
      name: 'validate',
      type: 'Void',
      javaCode: `
      if ( getFxRate() == 0 ) throw new ValidationException("fxRate is missing on PartnerLineItem");
      if ( getFxSpread() == 0 ) throw new ValidationException("fxSpread is missing on PartnerLineItem");
      if ( getTransactionFee() == 0 ) throw new ValidationException("transactionFee is missing on PartnerLineItem");
      if ( getTransactionFeeCurrency() == "" ) throw new ValidationException("transactionFeeCurrency is missing on PartnerLineItem");
      if ( getIOF() == 0 ) throw new ValidationException("IOF is missing on PartnerLineItem");
      if ( getIOFRate() == 0 ) throw new ValidationException("IOFRate is missing on PartnerLineItem");
      if ( getIOFCurrency() == "" ) throw new ValidationException("IOFCurrency is missing on PartnerLineItem");
      if ( getVET() == 0 ) throw new ValidationException("VET is missing on PartnerLineItem");
      if ( getBankFee() == 0 ) throw new ValidationException("bankFee is missing on PartnerLineItem");
      if ( getBankFeeRate() == 0 ) throw new ValidationException("bankFeeRate is missing on PartnerLineItem");
      if ( getBankFeeCurrency() == "" ) throw new ValidationException("bankFeeCurrency is missing on PartnerLineItem");
      `
    }
  ]
});
