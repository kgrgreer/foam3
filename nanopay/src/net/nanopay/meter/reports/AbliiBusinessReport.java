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
import foam.mlang.sink.Map;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import net.nanopay.account.Account;
import net.nanopay.auth.LoginAttempt;
import net.nanopay.bank.BankAccount;
import net.nanopay.sme.onboarding.BusinessOnboarding;
import net.nanopay.sme.onboarding.USBusinessOnboarding;
import net.nanopay.tx.model.Transaction;
import net.nanopay.model.Business;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

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
    DAO businessDAO             = (DAO) x.get("localBusinessDAO");
    DAO businessOnboardingDAO   = (DAO) x.get("businessOnboardingDAO");
    DAO uSBusinessOnboardingDAO = (DAO) x.get("uSBusinessOnboardingDAO");
    DAO transactionDAO          = (DAO) x.get("localTransactionDAO");
    DAO loginAttemptDAO         = (DAO) x.get("loginAttemptDAO");
    DAO agentJunctionDAO        = (DAO) x.get("agentJunctionDAO");
    DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    businessDAO.select(new AbstractSink() {
      public void put(Object obj, Detachable sub) {
        Business business = (Business) obj;

        // format the sign up date
        String signUpDate = dateFormat.format(business.getCreated());

        // find the person who created the business account
        User createdBy = business.findCreatedBy(x);
        String owner = createdBy == null ? "" : createdBy.getLegalName();

        // get the country of the business
        String country = business.getCountryOfBusinessRegistration();

        // check whether the business is onboarded
        String busVerification = business.getOnboarded() ? "Yes" : "No";

        // check whether a bankAccount has been added to the business
        Map map = new Map.Builder(x)
          .setArg1(Account.ID)
          .setDelegate(new ArraySink())
          .build();
        business.getAccounts(x).where(MLang.INSTANCE_OF(BankAccount.class)).select(map);
        List accountIds = ((ArraySink) map.getDelegate()).getArray();
        String bankAdded = accountIds.size() != 0 ? "Yes" : "No";

        // get the onboarding submitted date
        String onboardSubmitDate = "";
        if ( country.equals("CA") ) {
          BusinessOnboarding bo = (BusinessOnboarding) businessOnboardingDAO.find(
            MLang.EQ(BusinessOnboarding.BUSINESS_ID, business.getId()));
          if ( bo != null ) onboardSubmitDate = dateFormat.format(bo.getLastModified());
        }
        else if ( country.equals("US") ) {
          USBusinessOnboarding ubo = (USBusinessOnboarding) uSBusinessOnboardingDAO.find(
            MLang.EQ(USBusinessOnboarding.BUSINESS_ID, business.getId()));
          if ( ubo != null ) onboardSubmitDate = dateFormat.format(ubo.getLastModified());
        }

        // check whether the business has ever created a transaction
        String hasTxn = transactionDAO.find(
          MLang.IN(Transaction.SOURCE_ACCOUNT, accountIds)
        ) != null ? "Yes" : "No";

        // get the IP address of the last time any user of the business logged in
        map = new Map.Builder(x)
          .setArg1(UserUserJunction.SOURCE_ID)
          .setDelegate(new ArraySink())
          .build();
        agentJunctionDAO.where(MLang.EQ(UserUserJunction.TARGET_ID, business.getId())).select(map);
        List userIds = ((ArraySink) map.getDelegate()).getArray();
        LoginAttempt loginAttempt = (LoginAttempt) loginAttemptDAO.find(
            MLang.IN(LoginAttempt.LOGIN_ATTEMPTED_FOR, userIds));
        String ip = loginAttempt == null ? "" : loginAttempt.getIpAddress();

        // build the CSV line, the "" field need to be filled manually
        sb.append(AbliiBusinessReport.this.buildCSVLine(
          NUM_ELEMENTS,
          signUpDate,
          Long.toString(business.getId()),
          business.getBusinessName(),
          owner,
          country,
          busVerification,
          bankAdded,
          onboardSubmitDate,
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
