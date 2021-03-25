// ============ Payment Summary Report for Leadership =============
// Summary table index would be:
// [TYPE\DATE]                       Daily   Yesterday   Weekly  Month-to-Date   Last Month  Year-to-Date    Total
// Domestic Canada | In progress |
//                 | Completed   |
// Domestic USA    | In progress |
//                 | Completed   |
// International   | In progress |
//                 | Completed   |

// Use the following script to run the report:
// import net.nanopay.meter.reports.ReportPaymentSummary;
// rps = new ReportPaymentSummary();
// report = rps.createReport(x);
// print(report);

package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.MDAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.mlang.sink.Sum;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import foam.core.Currency;

import java.util.*;
import org.apache.commons.text.StringEscapeUtils;

import static foam.mlang.MLang.SUM;

public class ReportPaymentSummary extends AbstractReport {
  private final static int NUM_ELEMENTS = 16;
  private StringBuilder sb = new StringBuilder();

  private static class NumTotal {
    long num = 0;
    long total = 0;
  }

  // countDaily -> createdDate == today
  private NumTotal countDaily(X x, DAO transactions) {
    Date currentDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.set(Calendar.HOUR, 0);
    c.set(Calendar.MINUTE, 0);
    c.set(Calendar.SECOND, 0);
    Date today = c.getTime();
    NumTotal nt = new NumTotal();
    nt.num = ((Count) transactions.inX(x).where(
      MLang.GTE(Transaction.CREATED, today)
    ).select(new Count())).getValue();
    nt.total = ((Double) ((Sum) transactions.inX(x).where(
      MLang.GTE(Transaction.CREATED, today)
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
    return nt;
  }

  // countYesterday -> createdDate == yesterday
  private NumTotal countYesterday(X x, DAO transactions) {
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
      MLang.AND(
        MLang.GTE(Transaction.CREATED, yesterday),
        MLang.LT(Transaction.CREATED, today))
    ).select(new Count())).getValue();
    nt.total = ((Double) ((Sum) transactions.inX(x).where(
      MLang.AND(
        MLang.GTE(Transaction.CREATED, yesterday),
        MLang.LT(Transaction.CREATED, today))
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
    return nt;
  }

  // countWeekly -> createdDate in last 6 days + today
  private NumTotal countWeekly(X x, DAO transactions) {
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
      MLang.GTE(Transaction.CREATED, sevenDaysBefore)
    ).select(new Count())).getValue();
    nt.total = ((Double) ((Sum) transactions.inX(x).where(
      MLang.GTE(Transaction.CREATED, sevenDaysBefore)
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
    return nt;
  }

  // countMonthToDate -> createdDate in current month
  private NumTotal countMonthToDate(X x, DAO transactions) {
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
      MLang.GTE(Transaction.CREATED, firstDayOfMonth)
    ).select(new Count())).getValue();
    nt.total = ((Double) ((Sum) transactions.inX(x).where(
      MLang.GTE(Transaction.CREATED, firstDayOfMonth)
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
    return nt;
  }

  // countLastMonth -> createdDate in previous month
  private NumTotal countLastMonth(X x, DAO transactions) {
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
      MLang.AND(
        MLang.GTE(Transaction.CREATED, lastMonth),
        MLang.LT(Transaction.CREATED, thisMonth))
    ).select(new Count())).getValue();
    nt.total = ((Double) ((Sum) transactions.inX(x).where(
      MLang.AND(
        MLang.GTE(Transaction.CREATED, lastMonth),
        MLang.LT(Transaction.CREATED, thisMonth))
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
    return nt;
  }

  //  countYearToDate -> createdDate in current calendar year
  private NumTotal countYearToDate(X x, DAO transactions) {
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
      MLang.GTE(Transaction.CREATED, thisYear)
    ).select(new Count())).getValue();
    nt.total = ((Double) ((Sum) transactions.inX(x).where(
      MLang.GTE(Transaction.CREATED, thisYear)
    ).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
    return nt;
  }

  // summarize all the payments
  private NumTotal countTotal(X x, DAO transactions) {
    NumTotal nt = new NumTotal();
    nt.num = ((Count) transactions.inX(x).select(new Count())).getValue();
    nt.total = ((Double) ((Sum) transactions.inX(x).select(SUM(Transaction.AMOUNT))).getValue()).longValue();
    return nt;
  }


  private void appendTX(X x, DAO transactions, String countryLabel, String statusLabel, Currency currency) {
    this.sb.append(this.buildCSVLine(
      NUM_ELEMENTS,
      countryLabel,
      statusLabel,
      Long.toString(countDaily(x, transactions).num),
      StringEscapeUtils.escapeCsv(currency.format(countDaily(x, transactions).total)),
      Long.toString(countYesterday(x, transactions).num),
      StringEscapeUtils.escapeCsv(currency.format(countYesterday(x, transactions).total)),
      Long.toString(countWeekly(x, transactions).num),
      StringEscapeUtils.escapeCsv(currency.format(countWeekly(x, transactions).total)),
      Long.toString(countMonthToDate(x, transactions).num),
      StringEscapeUtils.escapeCsv(currency.format(countMonthToDate(x, transactions).total)),
      Long.toString(countLastMonth(x, transactions).num),
      StringEscapeUtils.escapeCsv(currency.format(countLastMonth(x, transactions).total)),
      Long.toString(countYearToDate(x, transactions).num),
      StringEscapeUtils.escapeCsv(currency.format(countYearToDate(x, transactions).total)),
      Long.toString(countTotal(x, transactions).num),
      StringEscapeUtils.escapeCsv(currency.format(countTotal(x, transactions).total))
    ));
  }

  // append the summary tx data for specific country/currency to the csv
  private void breakDown(X x, DAO transactions, String countryLabel, Currency currency) {
    // Retrieve all the root transaction from DAO
    List transactionRootLst = ((ArraySink) transactions.inX(x).where(
      MLang.EQ(Transaction.PARENT, ""))
      .select(new ArraySink())).getArray();

    DAO txsInProcess = new MDAO(Transaction.getOwnClassInfo());
    DAO txsCompleted = new MDAO(Transaction.getOwnClassInfo());
    for (Object obj : transactionRootLst) {
      Transaction transaction = (Transaction) obj;
      TransactionStatus state = transaction.getState(x);
      if ((state == TransactionStatus.PENDING) ||
        (state == TransactionStatus.SENT)) {
        // In Process (Any payment that has started processing but not yet completed)
        txsInProcess.put(transaction);
      } else if (state == TransactionStatus.COMPLETED) {
        // Completed (All components of the transaction is completed)
        txsCompleted.put(transaction);
      }
    }
    appendTX(x, txsInProcess, countryLabel, "In Process", currency);
    appendTX(x, txsCompleted, "", "Completed", currency);
  }

  // Main method to create the payment summary report for leadership
  public String createReport(X x) {

    // Set the headers for the report
    sb.append(this.buildCSVLine(
      NUM_ELEMENTS,
      "[TYPE\\DATE]",
      "",
      DateColumnOfReports.DAILY.getLabel(),
      DateColumnOfReports.DAILY.getLabel() + " Amount",
      DateColumnOfReports.YESTERDAY.getLabel(),
      DateColumnOfReports.YESTERDAY.getLabel() + " Amount",
      DateColumnOfReports.WEEKLY.getLabel(),
      DateColumnOfReports.WEEKLY.getLabel() + " Amount",
      DateColumnOfReports.MONTH_TO_DATE.getLabel(),
      DateColumnOfReports.MONTH_TO_DATE.getLabel() + " Amount",
      DateColumnOfReports.LAST_MONTH.getLabel(),
      DateColumnOfReports.LAST_MONTH.getLabel() + " Amount",
      DateColumnOfReports.YEAR_TO_DATE.getLabel(),
      DateColumnOfReports.YEAR_TO_DATE.getLabel() + " Amount",
      DateColumnOfReports.TOTAL.getLabel(),
      DateColumnOfReports.TOTAL.getLabel() + " Amount"
    ));

    // Retrieve the DAO
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    DAO currencyDAO = (DAO) x.get("currencyDAO");

    // Domestic Canada (payments originating and completing within Canada)
    DAO txDomesticCanada = new MDAO(Transaction.getOwnClassInfo());
    // Domestic USA (payments originating and completing with USA)
    DAO txDomesticUSA = new MDAO(Transaction.getOwnClassInfo());
    // International (payments originating and completing in different countries separated by destination currency)
    DAO txInternational = new MDAO(Transaction.getOwnClassInfo());

    List txLst = ((ArraySink) transactionDAO.select(new ArraySink())).getArray();

    for (Object obj : txLst) {
      Transaction transaction = (Transaction) obj;
      if ( transaction.findSourceAccount(x) == null ) {
        // throw new RuntimeException("Invalid Source/Payer Account");
        continue;
      }
      if ( transaction.findDestinationAccount(x) == null ) {
        // throw new RuntimeException("Invalid Destination/Payee Account");
        continue;
      }
      Account sourceAccount = transaction.findSourceAccount(x);
      Account destinationAccount = transaction.findDestinationAccount(x);
      if ( sourceAccount.findOwner(x) == null) {
        // throw new RuntimeException("No owner find for the Source/Payer Account");
        continue;
      }
      if ( destinationAccount.findOwner(x) == null) {
        // throw new RuntimeException("No owner find for the Destination/Payee Account");
        continue;
      }
      if ( sourceAccount.findOwner(x).getAddress() == null) {
        // throw new RuntimeException("No address find for the Source/Payer Account");
        continue;
      }
      if ( destinationAccount.findOwner(x).getAddress() == null) {
        // throw new RuntimeException("No address find for the Destination/Payee Account");
        continue;
      }

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
    breakDown(x, txDomesticCanada, "Domestic Canada", (Currency) currencyDAO.find("CAD"));
    breakDown(x, txDomesticUSA, "Domestic USA", (Currency) currencyDAO.find("USD"));

    this.sb.append(this.buildCSVLine(1, "International"));
    // order the transactions by destination currency
    txInternational.orderBy(Transaction.DESTINATION_CURRENCY);
    txLst = ((ArraySink) txInternational.select(new ArraySink())).getArray();
    txInternational = new MDAO(Transaction.getOwnClassInfo());
    // if there is no international transaction, return
    if (txLst.isEmpty()) {
      return sb.toString();
    }

    // separate by currency
    String curString = ((Transaction) txLst.get(0)).getDestinationCurrency();
    for (Object obj : txLst) {
      Transaction transaction = (Transaction) obj;
      if (transaction.getDestinationCurrency().equals(curString)) {
        txInternational.put(transaction);
      } else {
        breakDown(x, txInternational, "Destination " + curString, (Currency) currencyDAO.find(curString));
        txInternational = new MDAO(Transaction.getOwnClassInfo());
        txInternational.put(transaction);
        curString = transaction.getDestinationCurrency();
      }
    }
    breakDown(x, txInternational, "Destination " + curString, (Currency) currencyDAO.find(curString));

    return sb.toString();
  }

}
