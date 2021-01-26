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
  package: 'net.nanopay.partner.treviso.report',
  name: 'TrevisoTransactionReportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'A DAO decorator to generate the TrevisoTransactionReport',

  javaImports: [
    'static foam.mlang.MLang.*',

    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.partner.treviso.report.TrevisoTransactionReport',
    'net.nanopay.partner.treviso.tx.TrevisoTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.FeeSummaryTransactionLineItem',
    
    'java.text.DateFormat',
    'java.text.SimpleDateFormat',
    'java.util.*',
  ],

  constants: [
    {
      name: 'SPID',
      value: "treviso",
      type: 'String'
    }
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if ( sink == null )
          return super.select_(x, sink, skip, limit, order, predicate);

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, predicate);

        // Retrieve the DAO
        DAO businessDAO             = (DAO) x.get("localBusinessDAO");
        DAO businessOnboardingDAO   = (DAO) x.get("businessOnboardingDAO");
        DAO usBusinessOnboardingDAO = (DAO) x.get("uSBusinessOnboardingDAO");
        DAO transactionDAO          = (DAO) x.get("localTransactionDAO");
        DAO loginAttemptDAO         = (DAO) x.get("loginAttemptDAO");
        DAO agentJunctionDAO        = (DAO) x.get("agentJunctionDAO");
        DAO approvalRequestDAO      = (DAO) x.get("approvalRequestDAO");
        DateFormat dateFormat = new SimpleDateFormat("yyyy.MM.dd 'at' HH:mm:ss z");
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
    
        transactionDAO
          .where(AND(
            INSTANCE_OF(FXSummaryTransaction.class),
            EQ(FXSummaryTransaction.SPID, SPID)
          ))
          .select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            Transaction txn = (Transaction) obj;
    
            // Transaction ID
            String txnId = txn.getId();

            // Date and Time
            String date = txn.getCreated() == null ? "" : dateFormat.format(txn.getCreated());

            // Sender
            long payer = txn.findSourceAccount(x).getOwner();

            // Source Currency
            String sourceCurrency = txn.getSourceCurrency();

            // Receiver
            long payee = txn.findDestinationAccount(x).getOwner();

            // Destination Currency
            String destinationCurrency = txn.getDestinationCurrency();

            // Fee Summary Line Item
            FeeSummaryTransactionLineItem feeSummaryLineItem = null;
            for ( var lineItem : txn.getLineItems() ) {
              if ( lineItem instanceof FeeSummaryTransactionLineItem ) {
                feeSummaryLineItem = (FeeSummaryTransactionLineItem) lineItem;
                break;
              }
            }

            // Total Fees
            String totalFees = feeSummaryLineItem.getTotalFee();

            TrevisoTransactionReport ttr = new TrevisoTransactionReport.Builder(x)
              .setId(txnId)
              .setDate(date)
              .setPayer(payer)
              .setSourceCurrency(sourceCurrency)
              .setPayee(payee)
              .setDestinationCurrency(destinationCurrency)
              .setTotalFees(totalFees)
              .build();

            // Fee Line Items
            FeeLineItem feeLineItem = null;
            for ( var lineItem : feeSummaryLineItem.getLineItems() ) {
              if ( lineItem instanceof FeeLineItem ) {
                feeLineItem = (FeeLineItem) lineItem;
                break;
              }
            }

            // Total Amount
            long totalAmount = txn.getAmount() + feeLineItem.getAmount();
            ttr.setTotalAmount(totalAmount);

            for ( var rate : feeLineItem.getRates() ) {
              String name = rate.getName();
              switch (name) {
                case "Spot Rate":
                  ttr.setSpotRate(rate.getValue(rate));
                  break;
                case "Spread Rate":
                  ttr.setSpreadRate(rate.getValue(rate));
                  break;
                case "PTax Rate":
                  ttr.setPTaxRate(rate.getValue(rate));
                  break;
                case "Bank Fee":
                  ttr.setBankFee(rate.getValue(rate));
                  break;
              }
            }
            
            decoratedSink.put(ttr, null);
          }
        });

        return sink;
      `
    },
    {
      name: 'getFeeSummaryLineItems',
      type: 'FeeLineItem[]',
      args: [
        { name: 'transaction', type: 'Transaction' }
      ],
      javaCode: `
        List<FeeLineItem> list = new ArrayList<>();
        for ( var li : transaction.getLineItems() ) {
          if ( li instanceof FeeLineItem ) list.add((FeeLineItem) li);
        }
        return list.toArray(new FeeLineItem[0]);
      `
    }
  ]
});
