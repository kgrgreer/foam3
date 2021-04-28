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
  package: 'net.nanopay.partner.tx',
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
      documentation: 'rate partner uses for BRL -> destination conversion',
      label: 'Fx Rate'
    },
    {
      class: 'Double',
      name: 'fxSpread',
      label: 'Fx Spread',
      documentation: 'the spread partner applies'
    },
    {
      class: 'Double',
      name: 'effectiveRate',
      factory: function() {
        return this.fxSpread + this.fxRate;
      },
      label: 'Effective Rate',
      javaFactory: 'return getFxSpread() + getFxRate();'
    },
    {
      class: 'Long',
      name: 'feeAmount',
      label: 'Fee Amount',
      documentation: 'amount charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'feeCurrency',
      targetDAOKey: 'currencyDAO',
      label: 'Fee Currency',
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
      label: 'IOF Currency',
      documentation: 'currency of tax charged by partner'
    },
    {
      class: 'Double',
      name: 'IOFRate',
      label: 'IOF Rate',
    },
    {
      class: 'Double',
      name: 'VET'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'VETCurrency',
      targetDAOKey: 'currencyDAO',
      value: 'BRL',
      label: 'VET Currency'
    },
    {
      class: 'Long',
      name: 'fee2Amount',
      label: 'Fee2 Amount',
      documentation: 'additional amount charged by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'fee2Currency',
      targetDAOKey: 'currencyDAO',
      label: 'Fee2 Currency'
    },
    {
      class: 'Long',
      name: 'discountAmount',
      label: 'Discount Amount',
      documentation: 'discount given by the partner'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'discountCurrency',
      targetDAOKey: 'currencyDAO',
      label: 'Discount Currency',
      documentation: 'currency of discount given by partner'
    },
    {
      class: 'String',
      name: 'discountCode',
      label: 'Discount Code'
    },
    {
      class: 'Long',
      name: 'tax2',
      label: 'Tax2 Amount'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'tax2Currency',
      label: 'Tax2 Currency',
      targetDAOKey: 'currencyDAO'
    },
    {
      class: 'Double',
      name: 'tax2Rate',
      label: 'Tax3 Rate'
    },
    {
      class: 'String',
      name: 'natureCode',
      label: 'Nature Code'
    }
  ],

  methods: [
    {
      name: 'validate',
      type: 'Void',
      javaCode: `
      if ( getFxRate() == 0 ) throw new ValidationException("fxRate is missing on PartnerLineItem");

      if ( getFxSpread() == 0 ) throw new ValidationException("fxSpread is missing on PartnerLineItem");

      if ( getFeeAmount() == 0 ) throw new ValidationException("feeAmount is missing on PartnerLineItem");

      if ( getFeeCurrency() == "" ) throw new ValidationException("feeCurrency is missing on PartnerLineItem");

      if ( getIOF() == 0 ) throw new ValidationException("IOF is missing on PartnerLineItem");

      if ( getIOFRate() == 0 ) throw new ValidationException("IOFRate is missing on PartnerLineItem");

      if ( getIOFCurrency() == "" ) throw new ValidationException("IOFCurrency is missing on PartnerLineItem");

      if ( getVET() == 0 ) throw new ValidationException("VET is missing on PartnerLineItem");
      `
    }
  ]
});
