package net.nanopay.fx.ascendantfx;

import com.itextpdf.html2pdf.HtmlConverter;

import foam.blob.BlobService;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.fs.File;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.meter.IpHistory;
import net.nanopay.model.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class AscendantFXHTMLGenerator {

  public String generateCompanyInfo(X x, String userId) {
    DAO    userDAO           = (DAO) x.get("localUserDAO");
    DAO    businessTypeDAO   = (DAO) x.get("businessTypeDAO");
    DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
    DAO    businessSectorDAO = (DAO) x.get("businessSectorDAO");

    User user = (User) userDAO.find(userId);
    Business business;

    if ( user instanceof Business ) {
      business = (Business) user;
    } else {
      UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
      business = (Business) userDAO.find(userUserJunction.getTargetId());
    }

    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

    BusinessType type = (BusinessType) businessTypeDAO.find(business.getBusinessTypeId());
    String businessType = type.getName();
    String businessName = business.getBusinessName();
    String operatingName = business.getOperatingBusinessName();
    String streetAddress = business.getBusinessAddress().getStreetNumber() + " " + business.getBusinessAddress().getStreetName();
    String city = business.getBusinessAddress().getCity();
    String Province = business.getBusinessAddress().getRegionId();
    String postalCode = business.getBusinessAddress().getPostalCode();
    String businessPhoneNumber = business.getBusinessPhone().getNumber();
    BusinessSector businessSector = (BusinessSector) businessSectorDAO.find(business.getBusinessSectorId());
    String industry = businessSector.getName();

    String baseCurrency = business.getSuggestedUserTransactionInfo().getBaseCurrency();
    String foreignCurrency = baseCurrency.equals("CAD") ? "USD" : "CAD";
    String purposeOfTransactions = business.getSuggestedUserTransactionInfo().getTransactionPurpose();
    String annualTransactionAmount = business.getSuggestedUserTransactionInfo().getAnnualTransactionAmount();
    String annualVolume = business.getSuggestedUserTransactionInfo().getAnnualVolume();
    String firstTradeDate = sdf.format(business.getSuggestedUserTransactionInfo().getFirstTradeDate());

    String isThirdParty = business.getThirdParty() ? "Yes" : "No";
    String targetCustomers = business.getTargetCustomers();
    String sourceOfFunds = business.getSourceOfFunds();
    String isHoldingCompany = business.getHoldingCompany() ? "Yes" : "No";
    String annualRevenue = business.getSuggestedUserTransactionInfo().getAnnualRevenue();

    StringBuilder sb = new StringBuilder();
    sb.append("<html>");
    sb.append("<head>");
    sb.append("<meta charset=\"utf-8\">");
    sb.append("<title>Company Information</title>");
    sb.append("</head>");
    sb.append("<body>");
    sb.append("<h1>Company Information</h1>");
    sb.append("<ul>");
    sb.append("<li>Type of Business: ").append(businessType).append("</li>");
    sb.append("<li>Legal Name of Business: ").append(businessName).append("</li>");
    sb.append("<li>Operating Name: ").append(operatingName).append("</li>");
    sb.append("<li>Street Address: ").append(streetAddress).append("</li>");
    sb.append("<li>City: ").append(city).append("</li>");
    sb.append("<li>State/Province: ").append(Province).append("</li>");
    sb.append("<li>ZIP/Postal Code: ").append(postalCode).append("</li>");
    sb.append("<li>Business Phone Number: ").append(businessPhoneNumber).append("</li>");
    sb.append("<li>Industry: ").append(industry + " (" + businessSector.getId() + ")").append("</li>");
    sb.append("<li>Are you taking instructions from and/or conducting transactions on behalf of a 3rd party?  ").append(isThirdParty).append("</li>");
    sb.append("<li>Who do you market your products and services to? ").append(targetCustomers).append("</li>");
    sb.append("<li>Source of Funds (Where did you acquire the funds used to pay us?): ").append(sourceOfFunds).append("</li>");
    sb.append("<li>Is this a holding company? ").append(isHoldingCompany).append("</li>");
    sb.append("<li>Annual gross sales in your base currency: ").append(annualRevenue).append("</li>");
    sb.append("<li>Base currency: ").append(baseCurrency).append("</li>");

    sb.append("<li>International transfers: ");
    sb.append("<ul>");
    sb.append("<li>Currency Name: ").append(foreignCurrency).append("</li>");
    sb.append("<li>Purpose of Transactions: ").append(purposeOfTransactions).append("</li>");
    sb.append("<li>Annual Number of Transactions: ").append(annualTransactionAmount).append("</li>");
    sb.append("<li>Estimated Annual Volume in ").append(foreignCurrency).append(": ").append(annualVolume).append("</li>");
    sb.append("<li>Anticipated First Payment Date: ").append(firstTradeDate).append("</li>");
    sb.append("</ul>");
    sb.append("</li>");

    sb.append("</ul>");
    sb.append("</body>");
    sb.append("</html>");

    return sb.toString();
  }


  public String generateSigningOfficerInfo(X x, String userId) {
    DAO  userDAO                = (DAO) x.get("localUserDAO");
    DAO  identificationTypeDAO  = (DAO) x.get("identificationTypeDAO");
    DAO  agentJunctionDAO       = (DAO) x.get("agentJunctionDAO");
    DAO ipHistoryDAO            = (DAO) x.get("ipHistoryDAO");

    User user = (User) userDAO.find(userId);
    Business business;

    if ( user instanceof Business ) {
      business = (Business) user;
    } else {
      UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
      business = (Business) userDAO.find(userUserJunction.getTargetId());
    }

    String businessName = business.getBusinessName();

    User signingOfficer = (User) userDAO.find(AND(
      EQ(User.ORGANIZATION, businessName),
      EQ(User.SIGNING_OFFICER, true)));

    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    String name = signingOfficer.getLegalName();
    String title = signingOfficer.getJobTitle();
    String isDirector = "director".equalsIgnoreCase(title) ? "Yes" : "No";
    String isPEPHIORelated = signingOfficer.getPEPHIORelated() ? "Yes" : "No";

    String birthday = null;
    if ( signingOfficer.getBirthday() != null ) {
      birthday = sdf.format(signingOfficer.getBirthday());
    }
    String phoneNumber = null;
    if ( signingOfficer.getPhone() != null ) {
      phoneNumber = signingOfficer.getPhone().getNumber();
    }
    String email = signingOfficer.getEmail();
    String streetAddress = signingOfficer.getAddress().getStreetNumber() + " " + signingOfficer.getAddress().getStreetName();
    String city = signingOfficer.getAddress().getCity();
    String province = signingOfficer.getAddress().getRegionId();
    String postalCode = signingOfficer.getAddress().getPostalCode();
    IdentificationType idType = (IdentificationType) identificationTypeDAO
      .find(signingOfficer.getIdentification().getIdentificationTypeId());
    String identificationType = idType.getName();
    String provinceOfIssue = signingOfficer.getIdentification().getRegionId();
    String countryOfIssue = signingOfficer.getIdentification().getCountryId();
    String identificationNumber = signingOfficer.getIdentification().getIdentificationNumber();
    String issueDate = sdf.format(signingOfficer.getIdentification().getIssueDate());
    String expirationDate = sdf.format(signingOfficer.getIdentification().getExpirationDate());

    IpHistory ipHistory = (IpHistory) ipHistoryDAO.find(EQ(IpHistory.USER, signingOfficer.getId()));
    String nameOfPerson = ipHistory.findUser(x).getLegalName();
    String timestamp = sdf.format(ipHistory.getCreated());
    String ipAddress = ipHistory.getIpAddress();

    StringBuilder sb = new StringBuilder();
    sb.append("<html>");
    sb.append("<head>");
    sb.append("<meta charset=\"utf-8\">");
    sb.append("<title>Signing Officer Information</title>");
    sb.append("</head>");
    sb.append("<body>");
    sb.append("<h1>Signing Officer Information</h1>");
    sb.append("<ul>");
    sb.append("<li>Are you the primary contact? Yes").append("</li>");
    sb.append("<li>Are you a director of the company? ").append(isDirector).append("</li>");
    sb.append("<li>Are you a domestic or foreign Politically Exposed Person (PEP), Head of an International Organization (HIO), " +
      "or a close associate or family member of any such person? ").append(isPEPHIORelated).append("</li>");
    sb.append("<li>Name: ").append(name).append("</li>");
    sb.append("<li>Title: ").append(title).append("</li>");
    sb.append("<li>Date of birth: ").append(birthday).append("</li>");
    sb.append("<li>Phone number: ").append(phoneNumber).append("</li>");
    sb.append("<li>Email address: ").append(email).append("</li>");
    sb.append("<li>Residential street address: ").append(streetAddress).append("</li>");
    sb.append("<li>City: ").append(city).append("</li>");
    sb.append("<li>State/Province: ").append(province).append("</li>");
    sb.append("<li>ZIP/Postal Code: ").append(postalCode).append("</li>");
    sb.append("<li>Type of identification: ").append(identificationType).append("</li>");
    sb.append("<li>State/Province of issue: ").append(provinceOfIssue).append("</li>");
    sb.append("<li>Country of issue: ").append(countryOfIssue).append("</li>");
    sb.append("<li>Identification number: ").append(identificationNumber).append("</li>");
    sb.append("<li>Issue date: ").append(issueDate).append("</li>");
    sb.append("<li>Expiration date: ").append(expirationDate).append("</li>");
    sb.append("<li>Digital signature_Name of person: ").append(nameOfPerson).append("</li>");
    sb.append("<li>Digital signature_Timestamp: ").append(timestamp).append("</li>");
    sb.append("<li>Digital signature_Ip address: ").append(ipAddress).append("</li>");
    sb.append("</ul>");
    sb.append("</body>");
    sb.append("</html>");

    return sb.toString();
  }


  public String generateAuthorizedUserInfo(X x, String userId) {
    // None for now
    return null;
  }


  public String generateBeneficialOwners(X x, String userId) {
    DAO  userDAO                = (DAO) x.get("localUserDAO");
    DAO  agentJunctionDAO       = (DAO) x.get("agentJunctionDAO");

    User user = (User) userDAO.find(userId);
    Business business;

    if ( user instanceof Business ) {
      business = (Business) user;
    } else {
      UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
      business = (Business) userDAO.find(userUserJunction.getTargetId());
    }

    User[] beneficialOwners = business.getPrincipalOwners();

    StringBuilder sb = new StringBuilder();
    sb.append("<html>");
    sb.append("<head>");
    sb.append("<meta charset=\"utf-8\">");
    sb.append("<title>Beneficial Owners Information</title>");
    sb.append("</head>");
    sb.append("<body>");
    sb.append("<h1>Beneficial Owners Information</h1>");

    if ( beneficialOwners.length == 0 ) {
      sb.append("<ul>");
      sb.append("<li>No individuals own 25% or more / Owned by a publicly traded entity").append("</li>");
      sb.append("</ul>");
    } else {
      for ( int i = 0; i < beneficialOwners.length; i++ ) {
        User beneficialOwner = beneficialOwners[i];
        String firstName = beneficialOwner.getFirstName();
        String lastName = beneficialOwner.getLastName();
        String jobTitle = beneficialOwner.getJobTitle();
        String principalType = beneficialOwner.getPrincipleType();
        String streetAddress = beneficialOwner.getAddress().getStreetNumber() + " " + beneficialOwner.getAddress().getStreetName();
        String city = beneficialOwner.getAddress().getCity();
        String province = beneficialOwner.getAddress().getRegionId();
        String postalCode = beneficialOwner.getAddress().getPostalCode();
        // currently we don't store the info for Percentage of ownership, will add later
        // currently we don't store the info for Ownership (direct/indirect), will add later

        sb.append("<p>Beneficial Owner ").append(i + 1).append(":").append("<p>");
        sb.append("<ul>");
        sb.append("<li>First name: ").append(firstName).append("</li>");
        sb.append("<li>Last name: ").append(lastName).append("</li>");
        sb.append("<li>Job title: ").append(jobTitle).append("</li>");
        sb.append("<li>Principal type: ").append(principalType).append("</li>");
        sb.append("<li>Residential street address: ").append(streetAddress).append("</li>");
        sb.append("<li>City: ").append(city).append("</li>");
        sb.append("<li>State/Province: ").append(province).append("</li>");
        sb.append("<li>ZIP/Postal Code: ").append(postalCode).append("</li>");
        sb.append("</ul>");
      }
    }

    sb.append("</body>");
    sb.append("</html>");

    return sb.toString();
  }

  /**
   * Generate a transaction confirmation PDF for an AFX transaction.
   * @param x A context.
   * @param txn An AFX transaction.
   */
  public File generateTransactionConfirmationPDF(X x, AscendantFXTransaction txn) {
    // Generate the HTML.
    String doc = generateTransactionConfirmation(x, txn);

    // Use the library to generate a PDF from the HTML.
    ByteArrayOutputStream outStream = new ByteArrayOutputStream();
    try {
      HtmlConverter.convertToPdf(doc, outStream);
    } catch (IOException e) {
      Logger logger = (Logger) x.get("logger");
      logger.error("Error converting to PDF.");
    }
    int size = outStream.size();
    InputStream inStream = new ByteArrayInputStream(outStream.toByteArray());

    // Save the PDF on disk.
    BlobService blobStore = (BlobService) x.get("blobStore");
    foam.blob.Blob data = blobStore.put(new foam.blob.InputStreamBlob(inStream, size));

    // Save the file in fileDAO.
    DAO fileDAO = (DAO) x.get("fileDAO");
    foam.nanos.fs.File thePDF = new foam.nanos.fs.File.Builder(x)
      .setData(data)
      .setOwner(txn.findSourceAccount(x).getOwner())
      .setFilesize(size)
      .setFilename("TransactionConfirmation_" + txn.getId() + ".pdf")
      .setMimeType("application/pdf")
      .build();
    return (File) fileDAO.inX(x).put(thePDF);
  }

  /**
   * Generate a transaction confirmation HTML document for an AFX transaction.
   * @param x A context.
   * @param txn The AFX transaction to generate the HTML doc for.
   * @return A string containing the HTML of the report.
   */
  public String generateTransactionConfirmation(X x, AscendantFXTransaction txn) {
    // TODO: Add logic to `executeBeforePut` on AscendantFXTransaction` to call
    // this method, generate the PDF, and save a reference to it on the invoice.

    DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
    User payee = (User) localUserDAO.find(txn.findDestinationAccount(x).getOwner());
    User payer = (User) localUserDAO.find(txn.findSourceAccount(x).getOwner());

    Address payerAddress = payer.getBusinessAddress();
    String addressLine1 =
      (SafetyUtil.isEmpty(payerAddress.getSuite()) ? payerAddress.getSuite() + "-" : "") +
      payerAddress.getStreetNumber() +
      " " +
      payerAddress.getStreetName();
    String addressLine2 =
      payerAddress.getCity() +
      ", " +
      payerAddress.findRegionId(x).getName() +
      ", " +
      payerAddress.findCountryId(x).getName();
    boolean isCanadian = SafetyUtil.equals(payerAddress.getCountryId(), "CA");
    String afxPhoneNumber = isCanadian
      ? "1-877-452-7185"
      : "1-877-452-7186";
    String afxAddress = isCanadian
      ? "200 Bay St., North Tower, Ste. 1625 Toronto, M5J 2J1 Canada"
      : "3478 Buskirk Avenue, Suite 1000, Pleasant Hill, CA 94523";

    // Get the initiator, the person who created the invoice.
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    Invoice invoice = (Invoice) invoiceDAO.find(txn.getInvoiceId());
    long initiatorId = invoice.getCreatedBy();
    User initiator = (User) localUserDAO.find(initiatorId);

    // Get the releaser/approver, the person who created the transaction.
    User approver = (User) localUserDAO.find(txn.getCreatedBy());

    // Get and format the destination currency amount.
    DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
    Currency destCurrency = (Currency) currencyDAO.find(txn.getDestinationCurrency());
    String destAmountFormatted = destCurrency.format(txn.getDestinationAmount());

    // Get and format the rate.
    String rate = String.format("%.12f", 1.0 / txn.getFxRate());

    // Get and format the settlement amount.
    Currency srcCurrency = (Currency) currencyDAO.find(txn.getSourceCurrency());
    String settlementAmount = srcCurrency.format(txn.getAmount());

    // Get and format the fee.
    String fee = srcCurrency.format(txn.getCost());

    // Get and format the total settlement.
    String totalSettlement = srcCurrency.format(txn.getTotal());

    // Get the client ID.
    DAO ascendantFXUserDAO = ((DAO) x.get("ascendantFXUserDAO")).inX(x);
    AscendantFXUser afxUser = (AscendantFXUser) ascendantFXUserDAO.find(EQ(AscendantFXUser.USER, payer.getId()));
    String clientId = afxUser.getOrgId();

    String invoiceCreated = String.format("%tD %tI:%tM %Tp %TZ", invoice.getCreated(), invoice.getCreated(), invoice.getCreated(), invoice.getCreated(), invoice.getCreated());
    String transactionCreated = String.format("%tD %tI:%tM %Tp %TZ", txn.getCreated(), txn.getCreated(), txn.getCreated(), txn.getCreated(), txn.getCreated());

    StringBuilder doc = new StringBuilder();
    doc.append("<html>");
    doc.append("<head>");
    doc.append("<meta charset=\"utf-8\">");
    doc.append("<title>Order Confirmation</title>");
    doc.append("<style>");
    doc.append(".two-cols {");
    doc.append("  display: grid;");
    doc.append("  grid-template-columns: 1fr 1fr;");
    doc.append("}");
    doc.append("body {");
    doc.append("  width: 8.5in;");
    doc.append("  min-height: 11in;");
    doc.append("  font-family: sans-serif;");
    doc.append("  font-size: 12px;");
    doc.append("}");
    doc.append("h1 {");
    doc.append("  text-align: center;");
    doc.append("}");
    doc.append("h2 {");
    doc.append("  text-decoration: underline;");
    doc.append("}");
    doc.append("footer {");
    doc.append("  position: fixed;");
    doc.append("  bottom: 0;");
    doc.append("}");
    doc.append("table {");
    doc.append("  border-collapse: collapse;");
    doc.append("}");
    doc.append(".transaction td, .transaction th {");
    doc.append("  border: 1px solid #ddd;");
    doc.append("  padding: 3px;");
    doc.append("  vertical-align: top;");
    doc.append("}");
    doc.append(".transaction th {");
    doc.append("  background: #ddd;");
    doc.append("}");
    doc.append(".r-align {");
    doc.append("  text-align: right;");
    doc.append("}");
    doc.append("</style>");
    doc.append("</head>");
    doc.append("<body>");
    // doc.append(logo); // TODO: Figure out how to include the logo.
    doc.append("<h1>ORDER CONFIRMATION</h1>");
    doc.append("<div class=\"two-cols\">");
    doc.append("  <div>"); // left column
    doc.append("    <table>");
    doc.append("      <tr>");
    doc.append("        <td><b>Client ID:</b></td>");
    doc.append("        <td>").append(clientId).append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Client Name:</b></td>");
    doc.append("        <td>").append(payer.label()).append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Address:</b></td>");
    doc.append("        <td>").append(addressLine1).append("<br>").append(addressLine2).append("<br>").append(payerAddress.getPostalCode()).append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Tel:</b></td>");
    doc.append("        <td>").append(payer.getBusinessPhone().getNumber()).append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Fax:</b></td>");
    doc.append("        <td></td>"); // This can be left blank.
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Initiated By:</b></td>");
    doc.append("        <td>").append(initiator.label()).append(" [").append(invoiceCreated).append("]").append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Approved By:</b></td>");
    doc.append("        <td>").append(approver.label()).append(" [").append(transactionCreated).append("]").append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Released By:</b></td>");
    doc.append("        <td>").append(approver.label()).append(" [").append(transactionCreated).append("]").append("</td>");
    doc.append("      </tr>");
    doc.append("    </table>");
    doc.append("  </div>");
    doc.append("  <div>"); // right column
    doc.append("    <table>");
    doc.append("      <tr>");
    doc.append("        <td><b>Transaction Number:</b></td>");
    doc.append("        <td>").append(txn.getReferenceNumber()).append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Transaction Date:</b></td>");
    doc.append("        <td>").append(transactionCreated).append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Deal Type:</b></td>");
    doc.append("        <td>Spot</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Dealer:</b></td>");
    doc.append("        <td>AscendantFX</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Phone:</b></td>");
    doc.append("        <td>").append(afxPhoneNumber).append("</td>");
    doc.append("      </tr>");
    doc.append("      <tr>");
    doc.append("        <td><b>Email:</b></td>");
    doc.append("        <td>fxdesk@ascendantfx.com</td>");
    doc.append("      </tr>");
    doc.append("    </table>");
    doc.append("  </div>");
    doc.append("</div>");
    doc.append("<h2>Transaction Summary</h2>");
    doc.append("<table class=\"transaction\">");
    doc.append("  <tr>");
    doc.append("    <th>Item</th>");
    doc.append("    <th>Payee Name</th>");
    doc.append("    <th>Method</th>");
    doc.append("    <th>Cur.</th>");
    doc.append("    <th>Amount</th>");
    doc.append("    <th>Rate</th>");
    doc.append("    <th>Settlement Amount</th>");
    doc.append("    <th>Fee</th>");
    doc.append("    <th>Total Settlement</th>");
    doc.append("  </tr>");
    doc.append("  <tr>");
    doc.append("    <td>1</td>");
    doc.append("    <td>").append(payee.label()).append("</td>");
    doc.append("    <td>EFT/ACH</td>");
    doc.append("    <td>").append(txn.getDestinationCurrency()).append("</td>");
    doc.append("    <td class=\"r-align\">").append(destAmountFormatted).append("</td>");
    doc.append("    <td class=\"r-align\">").append(rate).append("</td>");
    doc.append("    <td class=\"r-align\">").append(settlementAmount).append("</td>");
    doc.append("    <td class=\"r-align\">").append(fee).append("</td>");
    doc.append("    <td class=\"r-align\">").append(totalSettlement).append("</td>");
    doc.append("  </tr>");
    doc.append("  <tr>");
    doc.append("    <td></td>");
    doc.append("    <td></td>");
    doc.append("    <td></td>");
    doc.append("    <td></td>");
    doc.append("    <td></td>");
    doc.append("    <td class=\"r-align\"><b>Total (").append(txn.getSourceCurrency()).append("):</b></td>");
    doc.append("    <td class=\"r-align\"><b>").append(settlementAmount).append("</b></td>");
    doc.append("    <td class=\"r-align\"><b>").append(fee).append("</b></td>");
    doc.append("    <td class=\"r-align\"><b>").append(totalSettlement).append("</b></td>");
    doc.append("  </tr>");
    doc.append("</table>");
    doc.append("<footer>");
    doc.append("  <p>").append(afxPhoneNumber).append(" | <b>www.ascendantfx.com</b></p>");
    doc.append("  <p>").append(afxAddress).append("</p>");
    doc.append("</footer>");
    doc.append("</body>");
    doc.append("</html>");

    return doc.toString();
  }
}

