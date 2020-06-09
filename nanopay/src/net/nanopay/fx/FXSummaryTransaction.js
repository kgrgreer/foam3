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
  package: 'net.nanopay.fx',
  name: 'FXSummaryTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Transaction used as a summary to for AFEX BMO transactions`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
     documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
     name: 'canTransfer',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'oldTxn',
         type: 'net.nanopay.tx.model.Transaction'
       }
     ],
     type: 'Boolean',
     javaCode: `
       return false;
     `
   },
   {
    documentation: `Collect all line items of succeeding transactions of self.`,
    name: 'collectLineItems',
    javaCode: `
    collectLineItemsFromChain(getNext());
    `
  },
  {
    documentation: `Collect all line items of succeeding transactions of transactions.`,
    name: 'collectLineItemsFromChain',
    args: [
      {
        name: 'transactions',
        type: 'net.nanopay.tx.model.Transaction[]'
      }
    ],
    javaCode: `
    if ( transactions != null ) {
      for ( Transaction transaction : transactions ) {
        addLineItems(transaction.getLineItems());
        collectLineItemsFromChain(transaction.getNext());
      }
    }
    `
  }
 ]

});
