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
  package: 'net.nanopay.meter.report',
  name: 'PaymentSummaryReportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `A DAO decorator to generate the payment summary report
      for leadership`,

  javaImports: [
    'foam.core.Currency',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.i18n.TranslationService',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Sum',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.meter.report.ReportStatus',
    'net.nanopay.meter.report.PaymentSummaryReport',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',

    'static foam.mlang.MLang.*',
    'java.util.*'
  ],

  messages: [
    { name: 'DOMESTIC_CANADA_MSG', message: 'Domestic Canada' },
    { name: 'DOMESTIC_USA_MSG', message: 'Domestic USA' },
    { name: 'INTERNATIONAL_MSG', message: 'International' }
  ],

  methods: [
    {
      name: 'countDaily',
      type: 'NumTotal',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' }
      ],
      javaCode: `
        Date currentDate = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(currentDate);
        c.set(Calendar.HOUR, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        Date today = c.getTime();
        NumTotal nt = new NumTotal();
        nt.num = ((Count) transactions.inX(x).where(
          GTE(Transaction.CREATED, today)
        ).select(new Count())).getValue();
        nt.total = ((Double) ((Sum) transactions.inX(x).where(
          GTE(Transaction.CREATED, today)
        ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
        return nt;
      `
    },
    {
      name: 'countYesterday',
      type: 'NumTotal',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' }
      ],
      javaCode: `
        Date currentDate = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(currentDate);
        c.set(Calendar.HOUR, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        Date today = c.getTime();
        c.add(Calendar.DATE, -1);
        Date yesterday = c.getTime();
        NumTotal nt = new NumTotal();
        nt.num = ((Count) transactions.inX(x).where(
          AND(
            GTE(Transaction.CREATED, yesterday),
            LT(Transaction.CREATED, today))
        ).select(new Count())).getValue();
        nt.total = ((Double) ((Sum) transactions.inX(x).where(
          AND(
            GTE(Transaction.CREATED, yesterday),
            LT(Transaction.CREATED, today))
        ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
        return nt;
      `
    },
    {
      name: 'countWeekly',
      type: 'NumTotal',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' }
      ],
      javaCode: `
        Date currentDate = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(currentDate);
        c.add(Calendar.DATE, -6);
        c.set(Calendar.HOUR, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        Date sevenDaysBefore = c.getTime();
        NumTotal nt = new NumTotal();
        nt.num = ((Count) transactions.inX(x).where(
          GTE(Transaction.CREATED, sevenDaysBefore)
        ).select(new Count())).getValue();
        nt.total = ((Double) ((Sum) transactions.inX(x).where(
          GTE(Transaction.CREATED, sevenDaysBefore)
        ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
        return nt;
      `
    },
    {
      name: 'countMonthToDate',
      type: 'NumTotal',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' }
      ],
      javaCode: `
        Date currentDate = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(currentDate);
        c.set(Calendar.DATE, 1);
        c.set(Calendar.HOUR, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        Date firstDayOfMonth = c.getTime();
        NumTotal nt = new NumTotal();
        nt.num = ((Count) transactions.inX(x).where(
          GTE(Transaction.CREATED, firstDayOfMonth)
        ).select(new Count())).getValue();
        nt.total = ((Double) ((Sum) transactions.inX(x).where(
          GTE(Transaction.CREATED, firstDayOfMonth)
        ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
        return nt;
      `
    },
    {
      name: 'countLastMonth',
      type: 'NumTotal',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' }
      ],
      javaCode: `
        Date currentDate = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(currentDate);
        c.set(Calendar.DATE, 1);
        c.set(Calendar.HOUR, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        Date thisMonth = c.getTime();
        c.add(Calendar.MONTH, -1);
        Date lastMonth = c.getTime();
        NumTotal nt = new NumTotal();
        nt.num = ((Count) transactions.inX(x).where(
          AND(
            GTE(Transaction.CREATED, lastMonth),
            LT(Transaction.CREATED, thisMonth))
        ).select(new Count())).getValue();
        nt.total = ((Double) ((Sum) transactions.inX(x).where(
          AND(
            GTE(Transaction.CREATED, lastMonth),
            LT(Transaction.CREATED, thisMonth))
        ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
        return nt;
      `
    },
    {
      name: 'countYearToDate',
      type: 'NumTotal',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' }
      ],
      javaCode: `
        Date currentDate = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(currentDate);
        c.set(Calendar.MONTH, 1);
        c.set(Calendar.DATE, 1);
        c.set(Calendar.HOUR, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        Date thisYear = c.getTime();
        NumTotal nt = new NumTotal();
        nt.num = ((Count) transactions.inX(x).where(
          GTE(Transaction.CREATED, thisYear)
        ).select(new Count())).getValue();
        nt.total = ((Double) ((Sum) transactions.inX(x).where(
          GTE(Transaction.CREATED, thisYear)
        ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
        return nt;
      `
    },
    {
      name: 'countTotal',
      type: 'NumTotal',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' }
      ],
      javaCode: `
        NumTotal nt = new NumTotal();
        nt.num = ((Count) transactions.inX(x).select(new Count())).getValue();
        nt.total = ((Double) ((Sum) transactions.inX(x).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
        return nt;
      `
    },
    {
      name: 'appendTX',
      type: 'PaymentSummaryReport',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' },
        { type: 'String', name: 'countryLabel' },
        { type: 'ReportStatus', name: 'status' },
        { type: 'Currency', name: 'currency' }
      ],
      javaCode: `
        NumTotal dailyNT = countDaily(x, transactions);
        NumTotal yesterdayNT = countYesterday(x, transactions);
        NumTotal weeklyNT = countWeekly(x, transactions);
        NumTotal monthToDateNT = countMonthToDate(x, transactions);
        NumTotal lastMonthNT = countLastMonth(x, transactions);
        NumTotal yearToDateNT = countYearToDate(x, transactions);
        NumTotal totalNT = countTotal(x, transactions);
        PaymentSummaryReport pst = new PaymentSummaryReport.Builder(x)
          .setTypeDate(countryLabel)
          .setStatus(status)
          .setDaily(Long.toString(dailyNT.num))
          .setDailyAmount(currency.format(dailyNT.total))
          .setYesterday(Long.toString(yesterdayNT.num))
          .setYesterdayAmount(currency.format(yesterdayNT.total))
          .setWeekly(Long.toString(weeklyNT.num))
          .setWeeklyAmount(currency.format(weeklyNT.total))
          .setMonthToDate(Long.toString(monthToDateNT.num))
          .setMonthToDateAmount(currency.format(monthToDateNT.total))
          .setLastMonth(Long.toString(lastMonthNT.num))
          .setLastMonthAmount(currency.format(lastMonthNT.total))
          .setYearToDate(Long.toString(yearToDateNT.num))
          .setYearToDateAmount(currency.format(yearToDateNT.total))
          .setTotal(Long.toString(totalNT.num))
          .setTotalAmount(currency.format(totalNT.total))
          .build();
        return pst;
      `
    },
    {
      name: 'breakDown',
      type: 'List',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'DAO', name: 'transactions' },
        { type: 'String', name: 'countryLabel' },
        { type: 'Currency', name: 'currency' }
      ],
      javaCode: `
        // Retrieve all the root transaction from DAO
        DAO txsInProcess = new MDAO(Transaction.getOwnClassInfo());
        DAO txsCompleted = new MDAO(Transaction.getOwnClassInfo());

        transactions.where(EQ(Transaction.PARENT, "")).select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            Transaction transaction = (Transaction) obj;
            TransactionStatus state = transaction.getState(x);
            if ( (state == TransactionStatus.PENDING) ||
              (state == TransactionStatus.SENT) ) {
              // In Process (Any payment that has started processing but not yet completed)
              txsInProcess.put(transaction);
            } else if (state == TransactionStatus.COMPLETED) {
              // Completed (All components of the transaction is completed)
              txsCompleted.put(transaction);
            }
          }
        });

        List tmpList = new ArrayList();
        tmpList.add(appendTX(x, txsInProcess, countryLabel, ReportStatus.IN_PROCESS, currency));
        tmpList.add(appendTX(x, txsCompleted, "", ReportStatus.COMPLETED, currency));
        return tmpList;
      `
    },
    {
      name: 'select_',
      javaCode: `
        if ( sink == null )
          return super.select_(x, sink, skip, limit, order, predicate);

        Sink decoratedSink = decorateSink(x, sink, skip, limit, order, predicate);

        List pstList = new ArrayList();
        // Retrieve the DAO
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        DAO currencyDAO = (DAO) x.get("currencyDAO");

        // Domestic Canada (payments originating and completing within Canada)
        DAO txDomesticCanada = new MDAO(Transaction.getOwnClassInfo());
        // Domestic USA (payments originating and completing with USA)
        DAO txDomesticUSA = new MDAO(Transaction.getOwnClassInfo());
        // International (payments originating and completing in different countries separated by destination currency)
        final DAO txInternational = new MDAO(Transaction.getOwnClassInfo());

        transactionDAO.select(new AbstractSink() {
          public void put(Object obj, Detachable sub) {
            Transaction transaction = (Transaction) obj;

            if ( transaction.findSourceAccount(x) == null ) return;
            if ( transaction.findDestinationAccount(x) == null ) return;
            Account sourceAccount = transaction.findSourceAccount(x);
            Account destinationAccount = transaction.findDestinationAccount(x);
            
            if ( sourceAccount.findOwner(x) == null) return;
            if ( destinationAccount.findOwner(x) == null) return;
            if ( sourceAccount.findOwner(x).getAddress() == null) return;
            if ( destinationAccount.findOwner(x).getAddress() == null) return;

            if ((sourceAccount.findOwner(x).getAddress().getCountryId().equals("CA")) &&
              (destinationAccount.findOwner(x).getAddress().getCountryId().equals("CA"))) {
              txDomesticCanada.put(transaction);
            } else if ((sourceAccount.findOwner(x).getAddress().getCountryId().equals("US")) &&
              (destinationAccount.findOwner(x).getAddress().getCountryId().equals("US"))) {
              txDomesticUSA.put(transaction);
            } else {
              txInternational.put(transaction);
            }
          }
        });
        
        Subject subject = (Subject) x.get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) x.get("translationService");

        pstList.addAll(breakDown(
          x,
          txDomesticCanada,
          ts.getTranslation(locale, getClassInfo().getId() + ".DOMESTIC_CANADA_MSG", DOMESTIC_CANADA_MSG),
          (Currency) currencyDAO.find("CAD")
        ));
        pstList.addAll(breakDown(
          x,
          txDomesticUSA,
          ts.getTranslation(locale, getClassInfo().getId() + ".DOMESTIC_USA_MSG", DOMESTIC_USA_MSG),
          (Currency) currencyDAO.find("USD")
        ));
    
        PaymentSummaryReport pst = new PaymentSummaryReport.Builder(x)
          .setTypeDate(ts.getTranslation(locale, getClassInfo().getId() + ".INTERNATIONAL_MSG", INTERNATIONAL_MSG))
          .build();
        pstList.add(pst);
        // order the transactions by destination currency
        txInternational.orderBy(Transaction.DESTINATION_CURRENCY);
        List txLst = ((ArraySink) txInternational.select(new ArraySink())).getArray();
        DAO txnInternational = new MDAO(Transaction.getOwnClassInfo());
        // if there is no international transaction, return
        if (txLst.isEmpty()) {
          long i = 1;
          for ( Object obj : pstList ) {
            PaymentSummaryReport paymentSummaryReport = (PaymentSummaryReport) obj;
            paymentSummaryReport.setId(i++);
            decoratedSink.put(paymentSummaryReport, null);
          }
          return sink;
        }
    
        // separate by currency
        String curString = ((Transaction) txLst.get(0)).getDestinationCurrency();
        for (Object obj : txLst) {
          Transaction transaction = (Transaction) obj;
          if (transaction.getDestinationCurrency().equals(curString)) {
            txnInternational.put(transaction);
          } else {
            pstList.addAll(breakDown(
              x,
              txnInternational,
              "Destination " + curString,
              (Currency) currencyDAO.find(curString)
            ));
            txnInternational = new MDAO(Transaction.getOwnClassInfo());
            txnInternational.put(transaction);
            curString = transaction.getDestinationCurrency();
          }
        }
        pstList.addAll(breakDown(
          x,
          txnInternational,
          "Destination " + curString,
          (Currency) currencyDAO.find(curString)
        ));

        long i = 1;
        for ( Object obj : pstList ) {
          PaymentSummaryReport paymentSummaryReport = (PaymentSummaryReport) obj;
          paymentSummaryReport.setId(i++);
          decoratedSink.put(paymentSummaryReport, null);
        }
        return sink;
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            private static class NumTotal {
              long num = 0;
              long total = 0;
            }
          `
        }));
      }
    }
  ]
});
