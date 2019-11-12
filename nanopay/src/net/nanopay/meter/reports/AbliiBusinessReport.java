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

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import net.nanopay.account.Account;
import net.nanopay.auth.LoginAttempt;
import net.nanopay.bank.BankAccount;
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
    DAO businessDAO      = (DAO) x.get("localBusinessDAO");
    DAO accountDAO       = (DAO) x.get("localAccountDAO");
    DAO transactionDAO   = (DAO) x.get("localTransactionDAO");
    DAO loginAttemptDAO  = (DAO) x.get("loginAttemptDAO");
    DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    businessDAO.select(new AbstractSink() {
      public void put(Object obj, Detachable sub) {
        Business business = (Business) obj;

        // format the sign up date
        String signUpDate = dateFormat.format(business.getCreated());

        // find the person who created the business account
        User createdBy = business.findCreatedBy(x);
        String owner = createdBy == null ? "" : createdBy.getLegalName();

        // check whether the business is onboarded
        String busVerification = business.getOnboarded() ? "Yes" : "No";

        // check whether a bankAccount has been added to the business
        List<BankAccount> bankAccountList = ((ArraySink) business.getAccounts(x)
          .where(MLang.INSTANCE_OF(BankAccount.class))
          .select(new ArraySink())).getArray();
        String bankAdded = bankAccountList.size() != 0 ? "Yes" : "No";

        // check whether the business has ever created a transaction
        String hasTxn = transactionDAO.find(
          MLang.IN(Transaction.SOURCE_ACCOUNT,
            bankAccountList.stream().map(BankAccount::getId).collect(Collectors.toList()))
        ) != null ? "Yes" : "No";

        // get the IP address of the last time any user of the business logged in
        List<UserUserJunction> agentJunctionList = ((ArraySink) agentJunctionDAO.where(
          MLang.EQ(UserUserJunction.TARGET_ID, business.getId())).select(new ArraySink())).getArray();
        LoginAttempt loginAttempt = (LoginAttempt) loginAttemptDAO.find(
            MLang.IN(LoginAttempt.LOGIN_ATTEMPTED_FOR,
              agentJunctionList.stream().map(UserUserJunction::getSourceId).collect(Collectors.toList())));
        String ip = loginAttempt == null ? "" : loginAttempt.getIpAddress();

        // build the CSV line, the "" field need to be filled manually
        sb.append(AbliiBusinessReport.this.buildCSVLine(
          NUM_ELEMENTS,
          signUpDate,
          Long.toString(business.getId()),
          business.getBusinessName(),
          owner,
          business.getCountryOfBusinessRegistration(),
          busVerification,
          bankAdded,
          "",
          "",
          "",
          business.getCompliance().toString(),
          "",
          "",
          hasTxn,
          "",
          ip,
          business.getEmail()
        ));
      }
    });

    return sb.toString();
  }
}
