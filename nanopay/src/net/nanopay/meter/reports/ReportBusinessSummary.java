// ============ Business Summary Report for Leadership =============
// Summary table index would be:
// [TYPE\DATE]             Daily   Yesterday   Weekly  Month-to-Date   Last Month  Year-to-Date    Total
// Registration          |
// Application Submitted |
// Approved              |
// Active                |
// Declined              |
// Locked                |

// Use the following script to run the report:
// import net.nanopay.meter.reports.ReportBusinessSummary;
// rbs = new ReportBusinessSummary();
// report = rbs.createReport(x);
// print(report);


package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.MDAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import net.nanopay.account.Account;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.model.Business;
import net.nanopay.meter.reports.DateColumnOfReports;
import net.nanopay.meter.reports.RowOfBusSumReports;

import java.util.*;


public class ReportBusinessSummary extends AbstractReport {
  private final static int NUM_ELEMENTS = 8;
  private final static int NUM_ROW = 6;
  private final static int NUM_COLUMN = 7;
  private long[][] summary = new long[NUM_ROW][NUM_COLUMN];  // Default zero.

  // countDaily -> createdDate == today
  private long countDaily(DAO businesses) {
    Date currentDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.set(Calendar.HOUR, 0);
    c.set(Calendar.MINUTE, 0);
    c.set(Calendar.SECOND, 0);
    Date today = c.getTime();
    Count count = (Count) businesses.where(
      MLang.GTE(Business.CREATED, today)
    ).select(new Count());
    return count.getValue();
  }

  // countYesterday -> createdDate == yesterday
  private long countYesterday(DAO businesses) {
    Date currentDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.set(Calendar.HOUR, 0);
    c.set(Calendar.MINUTE, 0);
    c.set(Calendar.SECOND, 0);
    Date today = c.getTime();
    c.add(Calendar.DATE, -1);
    Date yesterday = c.getTime();
    Count count = (Count) businesses.where(
      MLang.AND(
        MLang.GTE(Business.CREATED, yesterday),
        MLang.LT(Business.CREATED, today))
    ).select(new Count());
    return count.getValue();
  }

  // countWeekly -> createdDate in last 6 days + today
  private long countWeekly(DAO businesses) {
    Date currentDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.add(Calendar.DATE, -6);
    c.set(Calendar.HOUR, 0);
    c.set(Calendar.MINUTE, 0);
    c.set(Calendar.SECOND, 0);
    Date sevenDaysBefore = c.getTime();
    Count count = (Count) businesses.where(
      MLang.GTE(Business.CREATED, sevenDaysBefore)
    ).select(new Count());
    return count.getValue();
  }

  // countMonthToDate -> createdDate in current month
  private long countMonthToDate(DAO businesses) {
    Date currentDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.set(Calendar.DATE, 1);
    c.set(Calendar.HOUR, 0);
    c.set(Calendar.MINUTE, 0);
    c.set(Calendar.SECOND, 0);
    Date firstDayOfMonth = c.getTime();
    Count count = (Count) businesses.where(
      MLang.GTE(Business.CREATED, firstDayOfMonth)
    ).select(new Count());
    return count.getValue();
  }

  // countLastMonth -> createdDate in previous month
  private long countLastMonth(DAO businesses) {
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
    Count count = (Count) businesses.where(
      MLang.AND(
        MLang.GTE(Business.CREATED, lastMonth),
        MLang.LT(Business.CREATED, thisMonth))
    ).select(new Count());
    return count.getValue();
  }

  //  countYearToDate -> createdDate in current calendar year
  private long countYearToDate(DAO businesses) {
    Date currentDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.set(Calendar.MONTH, 1);
    c.set(Calendar.DATE, 1); //same with c.add(Calendar.DAY_OF_MONTH, 1);
    c.set(Calendar.HOUR, 0);
    c.set(Calendar.MINUTE, 0);
    c.set(Calendar.SECOND, 0);
    Date thisYear = c.getTime();
    Count count = (Count) businesses.where(
      MLang.GTE(Business.CREATED, thisYear)
    ).select(new Count());
    return count.getValue();
  }


  private void countToSummary(DAO businesses, int rowType) {
    this.summary[rowType][DateColumnOfReports.DAILY.ordinal()] = countDaily(businesses);
    this.summary[rowType][DateColumnOfReports.YESTERDAY.ordinal()] = countYesterday(businesses);
    this.summary[rowType][DateColumnOfReports.WEEKLY.ordinal()] = countWeekly(businesses);
    this.summary[rowType][DateColumnOfReports.MONTH_TO_DATE.ordinal()] = countMonthToDate(businesses);
    this.summary[rowType][DateColumnOfReports.LAST_MONTH.ordinal()] = countLastMonth(businesses);
    this.summary[rowType][DateColumnOfReports.YEAR_TO_DATE.ordinal()] = countYearToDate(businesses);
    this.summary[rowType][DateColumnOfReports.TOTAL.ordinal()] = ((Count) businesses.select(new Count())).getValue();
  }


  // Main method to create the business summary report for leadership
  public String createReport(X x) {

    // Retrieve the DAO
    DAO businessDAO = (DAO) x.get("businessDAO");


    // Registration (business created AND Compliance = "Pending")
    DAO businesses = businessDAO.where(
      MLang.EQ(Business.COMPLIANCE, ComplianceStatus.NOTREQUESTED)
    );
    countToSummary(businesses, RowOfBusSumReports.REGISTRATION.ordinal());


    // Application Submitted (Compliance = "Submitted" AND Onboarding is checked)
    businesses = businessDAO.where(
      MLang.AND(
        MLang.EQ(Business.COMPLIANCE, ComplianceStatus.REQUESTED),
        MLang.EQ(Business.ONBOARDED, true)
      )
    );
    countToSummary(businesses, RowOfBusSumReports.APPLICATION_SUBMITTED.ordinal());


    // Approved (Compliance = "Approved" AND Status = "Active", Onboarding is checked)
    businesses = businessDAO.where(
      MLang.AND(
        MLang.EQ(Business.COMPLIANCE, ComplianceStatus.PASSED),
        MLang.EQ(Business.STATUS, AccountStatus.ACTIVE),
        MLang.EQ(Business.ONBOARDED, true)
      )
    );
    countToSummary(businesses, RowOfBusSumReports.APPROVED.ordinal());


    // Active (If Approved AND at least 1 payment created in the last 30 days)
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    List busLst = ((ArraySink) businessDAO.where(
      MLang.EQ(Business.COMPLIANCE, ComplianceStatus.PASSED)
    ).select(new ArraySink())).getArray();

    // get the date 30 days before
    Date currentDate = new Date();
    Calendar c = Calendar.getInstance();
    c.setTime(currentDate);
    c.add(Calendar.DATE, -30);
    Date lastMonthDate = c.getTime();
    // create an empty DAO to convert list to DAO
    businesses = new MDAO(Business.getOwnClassInfo());
    // select accounts under the business
    DAO accountDAO = (DAO) x.get("localTransactionDAO");
    DAO filteredAccountDAO = new MDAO(Account.getOwnClassInfo());
    for (Object obj : busLst) {
      Business business = (Business) obj;
      filteredAccountDAO = accountDAO.where(
        MLang.EQ(net.nanopay.account.Account.OWNER, business.getId())
      );
      boolean active = (transactionDAO.find(
        MLang.AND(
          MLang.GTE(Transaction.CREATED, lastMonthDate),
          MLang.IN(Transaction.SOURCE_ACCOUNT, filteredAccountDAO)
        )
      ) != null);
      if (active) {
        businesses.put(business);
      }
    }
    countToSummary(businesses, RowOfBusSumReports.ACTIVE.ordinal());


    // Declined (Compliance ="Failed")
    businesses = businessDAO.where(
      MLang.EQ(Business.COMPLIANCE, ComplianceStatus.FAILED)
    );
    countToSummary(businesses, RowOfBusSumReports.DECLINED.ordinal());


    // Locked (Status = "Revoked")
    businesses = businessDAO.where(
      MLang.EQ(Business.STATUS, AccountStatus.REVOKED)
    );
    countToSummary(businesses, RowOfBusSumReports.LOCKED.ordinal());

    StringBuilder sb = new StringBuilder();

    // Set the headers for the report
    sb.append(this.buildCSVLine(
      NUM_ELEMENTS,
      "[TYPE\\DATE]",
        DateColumnOfReports.DAILY.getLabel(),
        DateColumnOfReports.YESTERDAY.getLabel(),
        DateColumnOfReports.WEEKLY.getLabel(),
        DateColumnOfReports.MONTH_TO_DATE.getLabel(),
        DateColumnOfReports.LAST_MONTH.getLabel(),
        DateColumnOfReports.YEAR_TO_DATE.getLabel(),
        DateColumnOfReports.TOTAL.getLabel()
    ));

    // Row headers
    String rowHeader[] = {
      RowOfBusSumReports.REGISTRATION.getLabel(),
      RowOfBusSumReports.APPLICATION_SUBMITTED.getLabel(),
      RowOfBusSumReports.APPROVED.getLabel(),
      RowOfBusSumReports.ACTIVE.getLabel(),
      RowOfBusSumReports.DECLINED.getLabel(),
      RowOfBusSumReports.LOCKED.getLabel()
    };

    // Append the data to the csv string
    for (int i=0;i<NUM_ROW;i++) {
      sb.append(this.buildCSVLine(
        NUM_ELEMENTS,
        rowHeader[i],
        Long.toString(this.summary[i][DateColumnOfReports.DAILY.ordinal()]),
        Long.toString(this.summary[i][DateColumnOfReports.YESTERDAY.ordinal()]),
        Long.toString(this.summary[i][DateColumnOfReports.WEEKLY.ordinal()]),
        Long.toString(this.summary[i][DateColumnOfReports.MONTH_TO_DATE.ordinal()]),
        Long.toString(this.summary[i][DateColumnOfReports.LAST_MONTH.ordinal()]),
        Long.toString(this.summary[i][DateColumnOfReports.YEAR_TO_DATE.ordinal()]),
        Long.toString(this.summary[i][DateColumnOfReports.TOTAL.ordinal()])
      ));
    }
    return sb.toString();
  }
}
