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
  name: 'SummaryTotalRateLineItemRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Override FX line items with total rate line items',

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.TotalRateLineItem',
    'net.nanopay.tx.FxSummaryTransactionLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Int',
      name: 'ratePrecision',
      value: 8
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        var quote = (TransactionQuote) obj;
        var txn = (Transaction) quote.getPlan();
        var totalRateLineItems = new ArrayList<TotalRateLineItem>();
        var nonSummarizedLineItems = new ArrayList<TransactionLineItem>();
        var totalRateSummary = new FxSummaryTransactionLineItem();

        for ( var item : txn.getLineItems() ) {
          if ( item instanceof FXLineItem ) {
            if ( item instanceof TotalRateLineItem ) {
              totalRateLineItems.add((TotalRateLineItem) item);
            }
          } else {
            nonSummarizedLineItems.add(item);
          }
        }

        if ( totalRateLineItems.size() > 0 ) {
          var lineItems = new TotalRateLineItem[totalRateLineItems.size()];
          var rate = 1.0;
          Date expiry = new Date();

          for ( var i = 0; i < totalRateLineItems.size(); i++ ) {
            lineItems[i] = totalRateLineItems.get(i);
            rate *= lineItems[i].getRate();
            if ( lineItems[i].getExpiry().before(expiry) ) {
              expiry = lineItems[i].getExpiry();
            }
          }
          totalRateSummary.setLineItems(lineItems);
          totalRateSummary.setExpiry(expiry);

          var currencyDAO = (DAO) x.get("currencyDAO");
          var sourceCurrency = (Currency) currencyDAO.find(quote.getSourceUnit());
          var destinationCurrency = (Currency) currencyDAO.find(quote.getDestinationUnit());
          totalRateSummary.setRate(formatRate(rate, sourceCurrency, destinationCurrency));

          var requestTxn = quote.getRequestTransaction();
          if ( requestTxn.getAmount() == 0 ) {
            txn.setAmount((long) (requestTxn.getDestinationAmount() / rate));
          }
          if ( requestTxn.getDestinationAmount() == 0 ) {
            txn.setDestinationAmount((long) (requestTxn.getAmount() * rate));
          }
          txn.setLineItems(nonSummarizedLineItems.toArray(new TransactionLineItem[nonSummarizedLineItems.size()]));
          txn.addLineItems(new TransactionLineItem[] { totalRateSummary });
          quote.setPlan(txn);
        }
      `
    },
    {
      name: 'formatRate',
      type: 'String',
      args: [
        { name: 'rate', type: 'Double' },
        { name: 'sourceCurrency', type: 'Currency' },
        { name: 'destinationCurrency', type: 'Currency' }
      ],
      javaCode: `
        destinationCurrency.setPrecision(getRatePrecision());

        Double sourcePrecision = Math.pow(10, sourceCurrency.getPrecision());
        Double destinationPrecision = Math.pow(10, destinationCurrency.getPrecision()) * rate;
        return sourceCurrency.format(sourcePrecision.longValue())
          + " " + sourceCurrency.getId()
          + " : " + destinationCurrency.format(destinationPrecision.longValue())
          + " " + destinationCurrency.getId();
      `
    }
  ]
});
