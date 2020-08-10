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
  package: 'net.nanopay.partner.treviso.tx',
  name: 'TrevisoSummaryLineItemRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    'net.nanopay.tx.FxSummaryTransactionLineItem',
    'net.nanopay.tx.SummaryTransactionLineItem',
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
        ArrayList<TransactionLineItem> fx = new ArrayList<>();
        ArrayList<TransactionLineItem> fee = new ArrayList<>();
        TransactionLineItem[] lineItem = txn.getLineItems();
        ArrayList<TransactionLineItem> summarizedLineItems = new ArrayList<>();
        FeeSummaryTransactionLineItem feeSummary = new FeeSummaryTransactionLineItem();
        FxSummaryTransactionLineItem fxSummary = new FxSummaryTransactionLineItem();
        if ( lineItem.length < 1 ) {
          return;
        }
    
        for ( TransactionLineItem item: lineItem ) {
          if ( item instanceof FXLineItem ) {
            fx.add(item);
          } else if ( item instanceof FeeLineItem ) {
            fee.add(item);
          } else {
            summarizedLineItems.add(item);
          }
        }
  
        if ( fx.size() > 0 ) {
          FXLineItem[] fxArray = fx.toArray((new FXLineItem[fx.size()]));
          fxSummary.setSummaryType("fx");
          fxSummary.setLineItems(fxArray);
          Currency source = null;
          Currency destination = null;
          Double fxRate = 1.0;
          if ( fx.size() == 1 ) {
            fxRate = fxArray[0].getRate();
            source = fxArray[0].getSourceCurrency();
            destination = fxArray[0].getSourceCurrency();
          } else {
            if ( fxArray[0].getSourceCurrency().getId().equals("BRL") ) {
              source = fxArray[0].getSourceCurrency();
              destination = fxArray[1].getDestinationCurrency();
            } else {
              source = fxArray[1].getSourceCurrency();
              destination = fxArray[0].getDestinationCurrency();
            }
            fxRate = fxArray[0].getRate() * fxArray[1].getRate();
          }
          Double srcPrecision = Math.pow(10, source.getPrecision());
          Double destPrecision = Math.pow(10, destination.getPrecision()) * fxRate;
          String rate = source.format(srcPrecision.longValue()) + source.getId() + " : " + destination.format(destPrecision.longValue()) + destination.getId();
          fxSummary.setRate(rate);
        }
  
        if ( fee.size() > 0 ) {
          FeeLineItem[] feeArray = fee.toArray((new FeeLineItem[fee.size()]));
          Long totalFee = 0l;
          Currency currency = feeArray[0].getFeeCurrency();
          for ( FeeLineItem feeLine: feeArray ) {
            totalFee += feeLine.getAmount();
          }
          feeSummary.setSummaryType("fee");
          feeSummary.setTotalFee(currency.format(totalFee) + currency.getId());
        }
    
        txn.setLineItems(summarizedLineItems.toArray(new TransactionLineItem[summarizedLineItems.size()]));
        txn.addLineItems(new TransactionLineItem[]{feeSummary,fxSummary});
        quote.setPlan(txn);
        return;
      `
    }
  ]
});
