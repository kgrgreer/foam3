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
  package: 'net.nanopay.tx.creditengine',
  name: 'AllFeeWaiver',
  extends: 'net.nanopay.tx.creditengine.FeeWaiver',

  documentation: `give a credit for each fee id on the transaction at the discount percentage specified `,

  javaImports: [
     'foam.core.X',
     'net.nanopay.tx.CreditLineItem',
     'net.nanopay.tx.FeeLineItem',
     'net.nanopay.tx.InvoicedCreditLineItem',
     'net.nanopay.tx.InvoicedFeeLineItem',
     'net.nanopay.tx.TransactionLineItem',
     'net.nanopay.tx.model.Transaction',
     'java.util.ArrayList',
  ],

  methods: [
    {
      name: 'createLineItems',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 't',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.CreditLineItem[]',
      javaCode: `
      ArrayList<CreditLineItem> array = new ArrayList<CreditLineItem>();
      for ( TransactionLineItem lineItem : t.getLineItems() ) {
        if (lineItem instanceof InvoicedFeeLineItem) {
          InvoicedCreditLineItem invoicedFeeRefund = new InvoicedCreditLineItem();
          invoicedFeeRefund.setSourceAccount(lineItem.getDestinationAccount());
          invoicedFeeRefund.setDestinationAccount(lineItem.getSourceAccount());
          invoicedFeeRefund.setCreditCurrency(lineItem.getCurrency());
          invoicedFeeRefund.setAmount(lineItem.getAmount());
          array.add(invoicedFeeRefund);
        } else if (lineItem instanceof FeeLineItem) {
          CreditLineItem feeRefund = new CreditLineItem();
          feeRefund.setCreditCurrency(lineItem.getCurrency());
          feeRefund.setSourceAccount(lineItem.getDestinationAccount());
          feeRefund.setDestinationAccount(lineItem.getSourceAccount());
          feeRefund.setAmount(lineItem.getAmount());
          array.add(feeRefund);
        }
      }
      return array.toArray(new CreditLineItem[array.size()]);
      `,
      documentation: 'Create a credit line item based on the transaction as a whole'
    },
  ]
});
