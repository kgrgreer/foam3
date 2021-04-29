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
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.Transfer',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Optional',
    'java.util.Set'
  ],

  constants: [
    {
      name: 'PRECISION',
      type: 'int',
      value: 4
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        for ( Transaction t : quote.getPlans() ) {
          if ( t instanceof SummaryTransaction || t instanceof FXSummaryTransaction ) {
            List items = new ArrayList<TransactionLineItem>();
            ArrayList eta = new  ArrayList<TransactionLineItem>();
            ArrayList fee = new  ArrayList<TransactionLineItem>();
            ArrayList fx = new  ArrayList<TransactionLineItem>();
            ArrayList expiry = new ArrayList<TransactionLineItem>();
            Set<String> added = new HashSet<>();

            walk(t, eta, fee, fx, expiry, items, added);

            t.setLineItems((TransactionLineItem[]) items.toArray(new TransactionLineItem[0]));

            // SummaryLineItem creation
            t = addETA(t, eta);
            t = addFx(t, fx, quote);
            t = addFee(t, fee);
            t = addExpiry(t, expiry);

            t.setAmount(t.getAmount() -t.getTotal(x,t.getSourceAccount()));
            if ( quote.getPlan() != null && quote.getPlan().getId().equals(t.getId()) ) {
              quote.setPlan(t);
            }
          }
        }

        return getDelegate().put_(x, quote);
      `
    },
    {
      name: 'walk',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'eta', type: 'java.util.ArrayList<TransactionLineItem>' },
        { name: 'fee', type: 'java.util.ArrayList<TransactionLineItem>' },
        { name: 'fx', type: 'java.util.ArrayList<TransactionLineItem>' },
        { name: 'expiry', type: 'java.util.ArrayList<TransactionLineItem>' },
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
          eta.addAll(Arrays.asList(((EtaSummaryTransactionLineItem) a).getLineItems()));
        } else if ( a instanceof FeeLineItem ) {
          fee.add(a);
        } else if ( a instanceof FeeSummaryTransactionLineItem ) {
          fee.addAll(Arrays.asList(((FeeSummaryTransactionLineItem) a).getLineItems()));
        } else if ( a instanceof FXLineItem ) {
          fx.add(a);
          expiry.add(a);
        } else if ( a instanceof FxSummaryTransactionLineItem ) {
          fx.addAll(Arrays.asList(((FxSummaryTransactionLineItem) a).getLineItems()));
          expiry.addAll(Arrays.asList(((FxSummaryTransactionLineItem) a).getLineItems()));
        } else if ( a instanceof ExpiryLineItem ) {
          expiry.add(a);
        } else if ( a instanceof ExpirySummaryTransactionLineItem ) {
          expiry.addAll(Arrays.asList(((ExpirySummaryTransactionLineItem) a).getLineItems()));
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

      if ( eta != null && eta.size() > 0 ) {
        TransactionLineItem[] etaArray = eta.toArray((new TransactionLineItem[eta.size()]));
        etaSummary.setLineItems(etaArray);
        Long totalEta = 0l;
        for ( TransactionLineItem etaLine: etaArray ) {
          totalEta += ((ETALineItem) etaLine).getEta();
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

      if ( fee != null && fee.size() > 0 ) {
        TransactionLineItem[] feeArray = fee.toArray((new TransactionLineItem[fee.size()]));
        feeSummary.setLineItems(feeArray);
        Long totalFee = 0l;
        Currency currency = (Currency) ((DAO) getX().get("currencyDAO")).find(((FeeLineItem) feeArray[0]).getFeeCurrency());
        for ( TransactionLineItem feeLine: feeArray ) {
            totalFee += ((FeeLineItem) feeLine).getAmount();
        }
        feeSummary.setAmount(totalFee);
        feeSummary.setCurrency(currency.getId());
        feeSummary.setTotalFee(currency.format(totalFee) + " " + currency.getId());
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

      if ( fx != null && fx.size() > 0 ) {
        TransactionLineItem[] fxArray = (TransactionLineItem[]) getTotalRates(fx).orElse(fx).toArray(new TransactionLineItem[0]);
        if ( fxArray.length > 0 ) fxSummary.setExpiry(((FXLineItem) fxArray[0]).getExpiry());
        fxSummary.setLineItems(fxArray);

        DAO      currencyDAO = (DAO) getX().get("currencyDAO");
        Currency      source = null;
        Currency destination = null;
        Double        fxRate = 1.0;

        if ( fxArray.length == 1 ) {
          fxRate = ((FXLineItem) fxArray[0]).getRate();
          source =(Currency) currencyDAO.find(((FXLineItem)fxArray[0]).getSourceCurrency());
          destination = (Currency) currencyDAO.find(((FXLineItem) fxArray[0]).getDestinationCurrency());
          fxSummary.setExpiry(((FXLineItem) fxArray[0]).getExpiry());
        } else {
          for ( TransactionLineItem tli : fxArray ) {
            FXLineItem fxLine = (FXLineItem) tli;
            fxRate *= fxLine.getRate();
            if ( fxLine.getExpiry().before(fxSummary.getExpiry()) ) {
              fxSummary.setExpiry(fxLine.getExpiry());
            }
          }
          source = (Currency) currencyDAO.find(quote.getSourceUnit());
          destination = (Currency) currencyDAO.find(quote.getDestinationUnit());
        }
        fxSummary.setRate(formatRate(fxRate, source, destination, PRECISION));
        fxSummary.setInverseRate(formatRate(1.0 / fxRate, destination, source, PRECISION));
        txn.addLineItems(new TransactionLineItem[] { fxSummary });

        // Update txn amount/destinationAmount based on the final fxRate, if not already done so
        Transaction requestTxn = quote.getRequestTransaction();
        if ( txn.getAmount() == 0 && requestTxn.getAmount() == 0) {
          // NOTE ONLY APPROXIMATION ROUNDING ERRORS POSSIBLE
          txn.setAmount((long) (requestTxn.getDestinationAmount() / fxRate));
          if (txn.getNext()[0] instanceof ComplianceTransaction && txn.getNext()[0].getAmount() == 0)
            txn.getNext()[0].setAmount(txn.getAmount()); // if theres a compliance, update also.
        }
        if ( txn.getDestinationAmount() == 0 && requestTxn.getDestinationAmount() == 0) {
          txn.setDestinationAmount((long) (requestTxn.getAmount() * fxRate));
          if (txn.getNext()[0] instanceof ComplianceTransaction && txn.getNext()[0].getDestinationAmount() == 0)
            txn.getNext()[0].setDestinationAmount(txn.getDestinationAmount()); // if theres a compliance, update also.
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
        // TODO Review why we did this
        // TransactionLineItem[] expiryArray = (TransactionLineItem[]) getTotalRates(expiry).orElse(expiry).toArray(new TransactionLineItem[0]);
        TransactionLineItem[] expiryArray = expiry.toArray(new TransactionLineItem[expiry.size()]);
        expirySummary.setLineItems(expiryArray);
        for ( TransactionLineItem tli: expiryArray ) {
        ExpiryLineItem exp = (ExpiryLineItem) tli;
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
        { name: 'destinationCurrency', type: 'Currency' },
        { name: 'extraPrecision', type: 'int' }
      ],
      javaCode: `
        Double sourcePrecision = Math.pow(10, sourceCurrency.getPrecision());
        destinationCurrency = (Currency)destinationCurrency.fclone();
        destinationCurrency.setPrecision(destinationCurrency.getPrecision()+extraPrecision);
        Double destinationPrecision = Math.pow(10, destinationCurrency.getPrecision()) * rate;
        return sourceCurrency.format(sourcePrecision.longValue())
          + " " + sourceCurrency.getId()
          + " : " + destinationCurrency.format(Math.round(destinationPrecision))
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
