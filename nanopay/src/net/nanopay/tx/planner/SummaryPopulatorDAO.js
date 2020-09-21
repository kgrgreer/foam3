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
    'net.nanopay.fx.TotalRateLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',

    'java.util.ArrayList',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Optional',
    'java.util.Set'
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
            Set<String> added = new HashSet<>();

            walk(t, eta, fee, fx, expiry, items, added);

            t.setLineItems((TransactionLineItem[]) items.toArray(new TransactionLineItem[0]));

            // SummaryLineItem creation
            t = addETA(t, eta);
            t = addFx(t, fx, quote);
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
        { name: 'added', type: 'Set' }
      ],
      documentation: 'Recursively walk the tree of transactions and add up lineitems',
      javaCode: `
      for (TransactionLineItem a : txn.getLineItems()) {
        if ( ! added.add(a.getId()) ) {
          continue;
        }

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
        } else {
          lineItems.add(a);
        }
      }
      if ( txn.getNext() != null && txn.getNext().length > 0)
        for ( Transaction t2 : txn.getNext() )
          walk(t2, eta, fee, fx, expiry, lineItems, added);
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
        { name: 'fx', type: 'java.util.ArrayList<TransactionLineItem>' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' }
      ],
      javaCode: `
      FxSummaryTransactionLineItem fxSummary = new FxSummaryTransactionLineItem();

      if ( fx.size() > 0 ) {
        FXLineItem[] fxArray = (FXLineItem[]) getTotalRates(fx).orElse(fx).toArray(new FXLineItem[0]);
        fxSummary.setLineItems(fxArray);

        DAO      currencyDAO = (DAO) getX().get("currencyDAO");
        Currency      source = null;
        Currency destination = null;
        Double        fxRate = 1.0;

        if ( fxArray.length == 1 ) {
          fxRate = fxArray[0].getRate();
          source = fxArray[0].getSourceCurrency();
          destination = fxArray[0].getDestinationCurrency();
          fxSummary.setExpiry(fxArray[0].getExpiry());
        } else {
          for ( FXLineItem fxLine : fxArray ) {
            fxRate *= fxLine.getRate();
            if ( fxLine.getExpiry().before(fxSummary.getExpiry()) ) {
              fxSummary.setExpiry(fxLine.getExpiry());
            }
          }
          source = (Currency) currencyDAO.find(quote.getSourceUnit());
          destination = (Currency) currencyDAO.find(quote.getDestinationUnit());
        }
        fxSummary.setRate(formatRate(fxRate, source, destination));
        txn.addLineItems(new TransactionLineItem[] { fxSummary });

        // Update txn amount/destinationAmount based on the final fxRate
        Transaction requestTxn = quote.getRequestTransaction();
        if ( requestTxn.getAmount() == 0 ) {
          txn.setAmount((long) (requestTxn.getDestinationAmount() / fxRate));
        }
        if ( requestTxn.getDestinationAmount() == 0 ) {
          txn.setDestinationAmount((long) (requestTxn.getAmount() * fxRate));
        }
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
    {
      name: 'getTotalRates',
      type: 'Optional<List>',
      args: [
        { name: 'fx', type: 'ArrayList<TransactionLineItem>' }
      ],
      javaCode: `
        List<TransactionLineItem> list = new ArrayList<>();
        for ( var item : fx ) {
          if ( item instanceof TotalRateLineItem ) {
            list.add(item);
          }
        }
        return list.isEmpty() ? Optional.empty() : Optional.of(list);
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
        Double sourcePrecision = Math.pow(10, sourceCurrency.getPrecision());
        Double destinationPrecision = Math.pow(10, destinationCurrency.getPrecision()) * rate;
        return sourceCurrency.format(sourcePrecision.longValue())
          + " " + sourceCurrency.getId()
          + " : " + destinationCurrency.format(destinationPrecision.longValue())
          + " " + destinationCurrency.getId();
      `
    }
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
