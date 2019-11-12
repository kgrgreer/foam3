/**
 * ============ Business Report for Ablii =============
 * Columns would be:
 * Signup Date
 * Business ID
 * Business Name
 * Owner Name
 * Country of Origin
 * Business Verification
 * Bank Added
 * Date Submitted
 * Ops Review
 * Compliance Review
 * Compliance Status
 * Reason if Declined
 * Reason for No Longer Interested
 * Transaction
 * Decision Date
 * IP Address
 * Email Address
 *
 * Use the following script to run the report:
 * import net.nanopay.meter.reports.AbliiBusinessReport;
 * abr = new AbliiBusinessReport();
 * report = abr.createReport(x);
 * print(report);
 */

package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.model.Business;
import net.nanopay.meter.IpHistory;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

public class AbliiBusinessReport extends AbstractReport {
  private final static int NUM_ELEMENTS = 17;

  // Main method to create the business summary report for leadership
  public String createReport(X x) {

    StringBuilder sb = new StringBuilder();

    // Set the headers for the report
    sb.append(this.buildCSVLine(
      NUM_ELEMENTS,
      "Signup Date",
      "Business ID",
      "Business Name",
      "Owner Name",
      "Country of Origin",
      "Business Verification",
      "Bank Added",
      "Date Submitted",
      "Ops Review",
      "Compliance Review",
      "Compliance Status",
      "Reason if Declined",
      "Reason for No Longer Interested",
      "Transaction",
      "Decision Date",
      "IP Address",
      "Email Address"
    ));

    // Retrieve the DAO
    DAO businessDAO    = (DAO) x.get("businessDAO");
    DAO accountDAO     = (DAO) x.get("localAccountDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO ipHistoryDAO   = (DAO) x.get("ipHistoryDAO");
    List busLst = ((ArraySink) businessDAO.select(new ArraySink())).getArray();

    for ( Object busObj : busLst ) {
      Business business = (Business) busObj;

      // format the sign up date
      DateFormat dateFormat = new SimpleDateFormat("yyyy-mm-dd");
      String signUpDate = dateFormat.format(business.getCreated());

      // check whether a bankAccount has been added to the business
      String bankAdded = business.getAccounts(x) != null ? "Yes" : "No";

      // check whether the business is onboarded
      String busVerification = business.getOnboarded() ? "Yes" : "No";

      // check whether the business has ever created a transaction
      List<Account> accountList = ((ArraySink) accountDAO.where(
        MLang.EQ(Account.OWNER, business.getId())).select(new ArraySink())).getArray();
      String hasTxn = transactionDAO.find(
        MLang.IN(Transaction.SOURCE_ACCOUNT, accountList.stream().map(Account::getId).collect(Collectors.toList()))
      ) != null ? "Yes" : "No";

      // get the ip history of the business
      IpHistory ipHistory = (IpHistory) ipHistoryDAO.find(MLang.EQ(IpHistory.BUSINESS, business.getId()));
      String ip = ipHistory == null ? "" : ipHistory.getIpAddress();

      // build the CSV line, the "" field need to be filled manually
      sb.append(this.buildCSVLine(
        NUM_ELEMENTS,
        signUpDate,
        Long.toString(business.getId()),
        business.getBusinessName(),
        Arrays.toString(business.getPrincipalOwners()),
        business.getCountryOfBusinessRegistration(),
        busVerification,
        bankAdded,
        "",
        "",
        "",
        business.getStatus().toString(),
        "",
        "",
        hasTxn,
        "",
        ip,
        business.getEmail()
      ));
    }

    return sb.toString();
  }
}
