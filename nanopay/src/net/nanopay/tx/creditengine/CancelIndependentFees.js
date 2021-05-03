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
  package: 'net.nanopay.tx.creditengine',
  name: 'CancelIndependentFees',
  extends: 'net.nanopay.tx.creditengine.FeeWaiver',

  documentation: `Removes all independent fee line items `,

  javaImports: [
     'foam.core.X',
     'net.nanopay.tx.CreditLineItem',
     'net.nanopay.tx.FeeLineItem',
     'net.nanopay.tx.InvoicedCreditLineItem',
     'net.nanopay.tx.InvoicedFeeLineItem',
     'net.nanopay.tx.model.Transaction',
     'net.nanopay.tx.TransactionLineItem',
     'java.util.ArrayList',
     'net.nanopay.tx.IndependentTransactionFeeLineItem'
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
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      ArrayList<TransactionLineItem> array = new ArrayList<TransactionLineItem>();
      for ( TransactionLineItem lineItem : t.getLineItems() ) {
        if ( ! (lineItem instanceof IndependantTransactionFeeLineItem) ) {
          array.add(lineItem);
        }
      }
      t.setLineItems(array.toArray(new TransactionLineItem[array.size()]));
      return t;
      `,
      documentation: 'Remove independentTransactionFee line items from transaction'
    }
  ]
});
