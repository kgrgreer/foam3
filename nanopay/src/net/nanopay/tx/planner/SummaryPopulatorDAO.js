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
  name: 'SummaryPopulatorDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Populates the summary transaction with lineitems and transfer stuff from all child txns
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.core.Currency',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.*',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',

    'java.util.ArrayList',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.List',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        for ( Transaction t : quote.getPlans() ) {
          if ( t instanceof SummaryTransaction || t instanceof FXSummaryTransaction ) {
            List items = new ArrayList<TransactionLineItem>();
            ArrayList eta = new  ArrayList<EtaSummaryTransactionLineItem>();
            ArrayList fee = new  ArrayList<FeeSummaryTransactionLineItem>();
            ArrayList fx = new  ArrayList<FxSummaryTransactionLineItem>();
            ArrayList expiry = new ArrayList<ExpirySummaryTransactionLineItem>();

            walk(t, eta, fee, fx, expiry, items);

            t.setLineItems((TransactionLineItem[]) items.toArray(new TransactionLineItem[0]));

            // SummaryLineItem creation
            t = addETA(t, eta);
            t = addFx(t, fx);
            t = addFee(t, fee);
            t = addExpiry(t, expiry);

            if ( quote.getPlan() != null && quote.getPlan().getId().equals(t.getId()) )
              quote.setPlan(t);
          }
        }

        return getDelegate().put_(x, quote);
      `
    },
    {
      name: 'walk',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'eta', type: 'java.util.ArrayList' },
        { name: 'fee', type: 'java.util.ArrayList' },
        { name: 'fx', type: 'java.util.ArrayList' },
        { name: 'expiry', type: 'java.util.ArrayList' },
        { name: 'lineItems', type: 'List' },
      ],
      documentation: 'Recursively walk the tree of transactions and add up lineitems',
      javaCode: `
      for (TransactionLineItem a : txn.getLineItems()) {
        a.setTransaction(txn.getId());
        if ( a instanceof ETALineItem ) {
          eta.add(a);
        } else if ( a instanceof EtaSummaryTransactionLineItem ) {
          eta.add(((EtaSummaryTransactionLineItem) a).getLineItems());
        } else if ( a instanceof FeeLineItem ) {
          fee.add(a);
        } else if ( a instanceof FeeSummaryTransactionLineItem ) {
          fee.add(((FeeSummaryTransactionLineItem) a).getLineItems());
        } else if ( a instanceof FXLineItem ) {
          fx.add(a);
          expiry.add(a);
        } else if ( a instanceof FxSummaryTransactionLineItem ) {
          fx.add(((FxSummaryTransactionLineItem) a).getLineItems());
          expiry.add(((FxSummaryTransactionLineItem) a).getLineItems());
        } else if ( a instanceof ExpiryLineItem ) {
          expiry.add(a);
        } else if ( a instanceof ExpirySummaryTransactionLineItem ) {
          expiry.add(((ExpirySummaryTransactionLineItem) a).getLineItems());
        }else {
          lineItems.add(a);
        }
      }
      if ( txn.getNext() != null && txn.getNext().length > 0)
        for ( Transaction t2 : txn.getNext() )
          walk(t2, eta, fee, fx, expiry, lineItems);
      `
    },
    {
      name: 'addETA',
      type: 'Transaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'eta', type: 'java.util.ArrayList<TransactionLineItem> ' }
      ],
      javaCode: `
      EtaSummaryTransactionLineItem etaSummary = new EtaSummaryTransactionLineItem();

      if ( eta.size() > 0 ) {
        ETALineItem[] etaArray = eta.toArray((new ETALineItem[eta.size()]));
        etaSummary.setLineItems(etaArray);
        Long totalEta = 0l;
        for ( ETALineItem etaLine: etaArray ) {
          totalEta += etaLine.getEta();
        }
        etaSummary.setEta(totalEta);  
        txn.addLineItems(new TransactionLineItem[]{etaSummary});
      }
      return txn;
      `
    },
    {
      name: 'addFee',
      type: 'Transaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'fee', type: 'java.util.ArrayList<TransactionLineItem> ' }
      ],
      javaCode: `
      FeeSummaryTransactionLineItem feeSummary = new FeeSummaryTransactionLineItem();

      if ( fee.size() > 0 ) {
        FeeLineItem[] feeArray = fee.toArray((new FeeLineItem[fee.size()]));
        feeSummary.setLineItems(feeArray);
        Long totalFee = 0l;
        Currency currency = feeArray[0].getFeeCurrency();
        for ( FeeLineItem feeLine: feeArray ) {
          totalFee += feeLine.getAmount();
        }
        feeSummary.setTotalFee(currency.format(totalFee) + currency.getId());
        txn.addLineItems(new TransactionLineItem[]{feeSummary});
      }
      return txn;
      `
    },
    {
      name: 'addFx',
      type: 'Transaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'fx', type: 'java.util.ArrayList<TransactionLineItem> ' }
      ],
      javaCode: `
      FxSummaryTransactionLineItem fxSummary = new FxSummaryTransactionLineItem();
    
      if ( fx.size() > 0 ) {
        FXLineItem[] fxArray = fx.toArray((new FXLineItem[fx.size()]));
        fxSummary.setLineItems(fxArray);
        Currency source = null;
        Currency destination = null;
        DAO currencyDAO = (DAO) getX().get("currencyDAO");
        Double fxRate = 1.0;
        if ( fx.size() == 1 ) {
          fxRate = fxArray[0].getRate();
          source = fxArray[0].getSourceCurrency();
          destination = fxArray[0].getDestinationCurrency();
          fxSummary.setExpiry(fxArray[0].getExpiry());
        } else {

          for ( FXLineItem fxLine: fxArray ) {
            fxRate *= fxLine.getRate();
            if ( fxSummary.getExpiry() == null || fxLine.getExpiry().before(fxSummary.getExpiry()) ) {
              fxSummary.setExpiry(fxArray[0].getExpiry());
            }
          }
          source = (Currency) currencyDAO.find(txn.getSourceCurrency());
          destination = (Currency) currencyDAO.find(txn.getDestinationCurrency());
          
        }
        Double srcPrecision = Math.pow(10, source.getPrecision());
        Double destPrecision = Math.pow(10, destination.getPrecision()) * fxRate;
        String rate = source.format(srcPrecision.longValue()) + source.getId() + " : " + destination.format(Math.round(destPrecision)) + destination.getId();
        fxSummary.setRate(rate);
        txn.addLineItems(new TransactionLineItem[]{fxSummary});
      }

      return txn;
      `
    },
    {
      name: 'addExpiry',
      type: 'Transaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'expiry', type: 'java.util.ArrayList<TransactionLineItem> ' }
      ],
      javaCode: `
      ExpirySummaryTransactionLineItem expirySummary = new ExpirySummaryTransactionLineItem();
      Calendar cal = new Calendar.Builder().setInstant(new Date()).build();
      cal.add(Calendar.HOUR,24);
      Date date = cal.getTime();
      
      if ( expiry.size() > 0 ) {
        ExpiryLineItem[] expiryArray = expiry.toArray((new ExpiryLineItem[expiry.size()]));
        expirySummary.setLineItems(expiryArray);
        for ( ExpiryLineItem exp: expiryArray ) {
          if ( exp.getExpiry() != null && date.after(exp.getExpiry()) ) {
            date = exp.getExpiry();
          } 
        }
      }
      expirySummary.setExpiry(date);  
      txn.addLineItems(new TransactionLineItem[]{expirySummary});
      return txn;
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public SummaryPopulatorDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
