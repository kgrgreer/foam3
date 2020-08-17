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
  package: 'net.nanopay.tx.planner',
  name: 'SummaryLineItemRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.EtaSummaryTransactionLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj; 
        Transaction txn = (Transaction) quote.getPlan(); 
        ArrayList<TransactionLineItem> eta = new ArrayList<>();
        TransactionLineItem[] lineItem = txn.getLineItems();
        ArrayList<TransactionLineItem> nonSummarizedLineItems = new ArrayList<>();
        EtaSummaryTransactionLineItem etaSummary = new EtaSummaryTransactionLineItem();

        if ( lineItem.length < 1 ) {
          return;
        }
    
        for ( TransactionLineItem item: lineItem ) {
          if ( item instanceof ETALineItem ) {
            eta.add(item);
          } else {
            nonSummarizedLineItems.add(item);
          }
        }
  
        if ( eta.size() > 0 ) {
          ETALineItem[] etaArray = eta.toArray((new ETALineItem[eta.size()]));
          etaSummary.setLineItems(etaArray);
          Long totalEta = 0l;
          for ( ETALineItem etaLine: etaArray ) {
            totalEta += etaLine.getEta();
          }
          etaSummary.setEta(totalEta);
        }
    
        txn.setLineItems(nonSummarizedLineItems.toArray(new TransactionLineItem[nonSummarizedLineItems.size()]));
        txn.addLineItems(new TransactionLineItem[]{etaSummary});
        quote.setPlan(txn);
        return;
      `
    }
  ]
});
