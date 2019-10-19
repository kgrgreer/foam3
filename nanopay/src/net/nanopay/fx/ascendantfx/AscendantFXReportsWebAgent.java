package net.nanopay.fx.ascendantfx;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.IdentifiedBlob;
import foam.blob.ProxyBlobService;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.flinks.model.FlinksAccountsDetailResponse;
import net.nanopay.meter.IpHistory;
import net.nanopay.model.*;
import net.nanopay.sme.onboarding.BusinessOnboarding;
import net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding;
import net.nanopay.sme.onboarding.OnboardingStatus;
import net.nanopay.sme.onboarding.USBusinessOnboarding;
import net.nanopay.payment.Institution;
import net.nanopay.plaid.PlaidResultReport;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.text.DecimalFormat;
import java.util.Date;
import java.util.TimeZone;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static foam.mlang.MLang.*;

public class AscendantFXReportsWebAgent extends ProxyBlobService implements WebAgent {

  protected String name_;

  public AscendantFXReportsWebAgent(X x, BlobService delegate) {
    this(x, "AscendantFXReports", delegate);
  }

  public AscendantFXReportsWebAgent(X x, String name, BlobService delegate) {
    setX(x);
    setDelegate(delegate);
    name_ = name;
  }

  @Override
  public void execute(X x) {
    DAO    userDAO           = (DAO) x.get("localUserDAO");
    DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
    Logger logger            = (Logger) x.get("logger");

    HttpServletRequest req     = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);

    String id = req.getParameter("userId");
    User user = (User) userDAO.find(id);
    Business business;

    if ( user instanceof Business ) {
      business = (Business) user;
    } else {
      UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
      business = (Business) userDAO.find(userUserJunction.getTargetId());
    }

    try {
      // create a temporary folder to save files before zipping
      FileUtils.forceMkdir(new File("/tmp/ComplianceReport/"));

      File[] signingOfficerReports = generateSigningOfficersReports(x, business);
      File[] signingOfficerIDs = getSigningOfficerIDs(x, business);
      File[] srcFiles = new File[6 + signingOfficerReports.length + signingOfficerIDs.length];
      srcFiles[0] = generateCompanyInfo(x, business);
      srcFiles[1] = generateBeneficialOwners(x, business);
      srcFiles[2] = generateBankInfo(x, business);
      srcFiles[3] = getBusinessDoc(x, business);
      srcFiles[4] = generateCompanyDirectorsList(x, business);
      // srcFiles[4] = getUSBankAccountProof(x, business);
      // srcFiles[5] = getBeneficialOwnersDoc(x, business);
      int signingOfficerReportLength = signingOfficerReports == null ? 0 : signingOfficerReports.length;
      int signingOfficerIdLength     = signingOfficerIDs == null ? 0 : signingOfficerIDs.length;
      System.arraycopy(signingOfficerReports, 0, srcFiles, 6, signingOfficerReportLength);
      System.arraycopy(signingOfficerIDs, 0, srcFiles, 6 + signingOfficerReportLength, signingOfficerIdLength);

      downloadZipFile(x, business, srcFiles);

      // delete the temporary folder. Later if we want to archive those files, we can keep the folder.
      FileUtils.deleteDirectory(new File("/tmp/ComplianceReport/"));
    } catch (IOException e) {
      logger.error(e);
      try {
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR , "Error when generating the compliance documents.");
      } catch (IOException err) {
        throw new RuntimeException(err);
      }

    } catch (Throwable t) {
      logger.error("Error generating compliance report package: ", t);
      logger.log(user.getOrganization() + " might not have all the business registration information.");
      try {
        response.sendError(HttpServletResponse.SC_NO_CONTENT , user.getOrganization() + " might not have all the business registration information.");
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
  }


  private File generateCompanyInfo(X x, Business business) {
    DAO    businessTypeDAO   = (DAO) x.get("businessTypeDAO");
    DAO    businessSectorDAO = (DAO) x.get("businessSectorDAO");
    DAO    businessOnboardingDAO = (DAO) x.get("businessOnboardingDAO");
    DAO    canadaUsBusinessOnboardingDAO = (DAO) x.get("canadaUsBusinessOnboardingDAO");
    DAO    uSBusinessOnboardingDAO = (DAO) x.get("uSBusinessOnboardingDAO");
    Logger logger            = (Logger) x.get("logger");

    ArraySink businessOnBoardingSink = (ArraySink) businessOnboardingDAO.where(AND(EQ( BusinessOnboarding.BUSINESS_ID, business.getId()), EQ(BusinessOnboarding.STATUS, OnboardingStatus.SUBMITTED))).select(new ArraySink()); canadaUsBusinessOnboardingDAO.where(AND(EQ(CanadaUsBusinessOnboarding.BUSINESS_ID, business.getId()), EQ(CanadaUsBusinessOnboarding.STATUS, OnboardingStatus.SUBMITTED))).select(businessOnBoardingSink); uSBusinessOnboardingDAO.where(AND(EQ(USBusinessOnboarding.BUSINESS_ID, business.getId()), EQ(USBusinessOnboarding.STATUS, OnboardingStatus.SUBMITTED))).select(businessOnBoardingSink);
    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
    BusinessType type = (BusinessType) businessTypeDAO.find(business.getBusinessTypeId());
    boolean isTypeSet, isBusinessSet, isBusinessAddressSet;
    isTypeSet = type != null;
    isBusinessSet = business != null;
    isBusinessAddressSet = isBusinessSet && business.getAddress() != null;
    String businessType  = isTypeSet ? type.getName() : "-";
    String businessName  = isBusinessSet ? business.getBusinessName() : "-";;
    String operatingName = isBusinessSet ? business.getOperatingBusinessName() : "-";;
    String streetAddress = isBusinessAddressSet ? business.getAddress().getStreetNumber() + " " + business.getAddress().getStreetName() : "-";
    String city = isBusinessAddressSet ? business.getAddress().getCity() : "-";
    String province = isBusinessAddressSet ? business.getAddress().getRegionId() : "-";
    String country = isBusinessAddressSet ? business.getAddress().getCountryId() : "-";
    String postalCode = isBusinessAddressSet ? business.getAddress().getPostalCode() : "-";
    String businessReg = business.getBusinessRegistrationDate() != null ? new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss Z").format(business.getBusinessRegistrationDate()) : "-";

    String businessPhoneNumber;
    if ( isBusinessSet && business.getPhone() != null ) {
      if ( ! SafetyUtil.isEmpty(business.getPhone().getNumber()) ) {
        businessPhoneNumber = business.getPhone().getNumber();
      } else {
        businessPhoneNumber = "N/A";
      }
    } else {
      businessPhoneNumber = "N/A";
    }

    String industry;
    String businessSectorId;

    if ( isBusinessSet && business.getBusinessSectorId() != 0) {
      BusinessSector businessSector = (BusinessSector) businessSectorDAO.find(business.getBusinessSectorId());
      if ( businessSector != null) {
        industry = businessSector.getName();
        businessSectorId = String.valueOf(business.getBusinessSectorId());
      }
      else {
        industry = "N/A";
        businessSectorId = "N/A";
      }
    } else {
      industry = "N/A";
      businessSectorId = "N/A";
    }

    String isThirdParty = isBusinessSet && business.getThirdParty() ? "Yes" : "No";

    String targetCustomers;
    if ( ! SafetyUtil.isEmpty(business.getTargetCustomers()) ) {
      targetCustomers = business.getTargetCustomers();
    } else {
      targetCustomers = "N/A";
    }

    String sourceOfFunds;
    if ( ! SafetyUtil.isEmpty(business.getSourceOfFunds()) ) {
      sourceOfFunds = business.getSourceOfFunds();
    } else {
      sourceOfFunds = "N/A";
    }

    String residenceOperated = business.getResidenceOperated() ? "Yes" : "No";
    String baseCurrency;
    String internationalTransactions;
    String purposeOfTransactions;
    String annualDomesticTransactionAmount;
    String annualDomesticVolume;
    String annualRevenue;
    String firstTradeDateDomestic;
    

    if ( isBusinessSet && business.getSuggestedUserTransactionInfo() != null ) {
      internationalTransactions = business.getSuggestedUserTransactionInfo().getInternationalPayments() ? "Yes" : "No";

      if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getTransactionPurpose()) ) {
        baseCurrency = business.getSuggestedUserTransactionInfo().getBaseCurrency();
      } else {
        baseCurrency = "N/A";
      }

      if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getTransactionPurpose()) ) {
        purposeOfTransactions = business.getSuggestedUserTransactionInfo().getTransactionPurpose();
      } else {
        purposeOfTransactions = "N/A";
      }

      if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getAnnualTransactionFrequency()) ) {
        annualDomesticTransactionAmount = business.getSuggestedUserTransactionInfo().getAnnualTransactionFrequency();
      } else {
        annualDomesticTransactionAmount = "N/A";
      }

      if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getAnnualDomesticVolume()) ) {
        annualDomesticVolume = business.getSuggestedUserTransactionInfo().getAnnualDomesticVolume();
      } else {
        annualDomesticVolume = "N/A";
      }

      if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getAnnualRevenue()) ) {
        annualRevenue = business.getSuggestedUserTransactionInfo().getAnnualRevenue();
      } else {
        annualRevenue = "N/A";
      }

      if ( isBusinessSet && business.getSuggestedUserTransactionInfo() != null && business.getSuggestedUserTransactionInfo().getFirstTradeDateDomestic() != null ) {
        firstTradeDateDomestic = sdf.format(business.getSuggestedUserTransactionInfo().getFirstTradeDateDomestic());
      } else {
        firstTradeDateDomestic = "N/A";
      }
    } else {
      internationalTransactions = "N/A";
      purposeOfTransactions = "N/A";
      annualDomesticTransactionAmount = "N/A";
      annualDomesticVolume = "N/A";
      annualRevenue = "N/A";
      firstTradeDateDomestic = "N/A";
      baseCurrency = "N/A";
    }

    SimpleDateFormat df = new SimpleDateFormat("yyyy/MM/dd, HH:mm:ss");
    String reportGeneratedDate = df.format(new Date());

    String path = "/tmp/ComplianceReport/[" + businessName + "]CompanyInfo.pdf";

    try {
      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
      document.open();
      document.add(new Paragraph("Company Information"));

      List list = new List(List.UNORDERED);
      list.add(new ListItem("Currency choices for this business will be USD and CAD")); // TODO this is hardcoded for Currency choice AFEX wants confirmation of. Future this should be dynamically set.
      if ( !country.equals("US") ) list.add(new ListItem("Business Registration: " + businessReg));
      list.add(new ListItem("Type of Business: " + businessType));
      list.add(new ListItem("Legal Name of Business: " + businessName));
      if ( operatingName.length() != 0 ) {
        list.add(new ListItem("Operating Name: " + operatingName));
      }
      list.add(new ListItem("Street Address: " + streetAddress));
      list.add(new ListItem("City: " + city));
      list.add(new ListItem("State/Province: " + province));
      list.add(new ListItem("Country: " + country));
      list.add(new ListItem("ZIP/Postal Code: " + postalCode));
      list.add(new ListItem("Business Phone Number: " + businessPhoneNumber));
      list.add(new ListItem("Industry: " + industry + " (" + businessSectorId + ") - NAICS"));
      if ( country.equals("US") ) {
        String taxId = business.getTaxIdentificationNumber();
        list.add(new ListItem("Tax Identification Number: " + taxId));
      }
      list.add(new ListItem("Do you operate this business from your residence? " + residenceOperated));
      list.add(new ListItem("Are you taking instructions from and/or conducting transactions on behalf of a 3rd party? " + isThirdParty));
      list.add(new ListItem("Who do you market your products and services to? " + targetCustomers));
      list.add(new ListItem("Source of Funds (Where did you acquire the funds used to pay us?): " + sourceOfFunds));
      list.add(new ListItem("Transaction purpose: " + purposeOfTransactions));
      if ( purposeOfTransactions.equals("Other") ) {
        String otherPurposeOfTransactions;
        if ( business.getSuggestedUserTransactionInfo() != null ) {
          if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getOtherTransactionPurpose()) ) {
            otherPurposeOfTransactions = business.getSuggestedUserTransactionInfo().getOtherTransactionPurpose();
          } else {
            otherPurposeOfTransactions = "N/A";
          }
        } else {
          otherPurposeOfTransactions = "N/A";
        }
        list.add(new ListItem("Other transaction purpose: " + otherPurposeOfTransactions));
      }
      list.add(new ListItem("Annual gross sales: " + baseCurrency + " " + annualRevenue));
      document.add(Chunk.NEWLINE);
      // if user going to do transactions to the USA, we add International transfers report
      if ( internationalTransactions.equals("Yes") ) {
        String foreignCurrency = baseCurrency.equals("CAD") ? "USD" : "CAD";
        String annualTransactionAmount;
        String annualVolume;
        String firstTradeDate;

        if ( business.getSuggestedUserTransactionInfo() != null ) {
          if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getAnnualTransactionAmount()) ) {
            annualTransactionAmount = business.getSuggestedUserTransactionInfo().getAnnualTransactionAmount();
          } else {
            annualTransactionAmount = "N/A";
          }

          if ( ! SafetyUtil.isEmpty(business.getSuggestedUserTransactionInfo().getAnnualVolume()) ) {
            annualVolume = business.getSuggestedUserTransactionInfo().getAnnualVolume();
          } else {
            annualVolume = "N/A";
          }

          if ( business.getSuggestedUserTransactionInfo().getFirstTradeDate() != null ) {
            firstTradeDate = sdf.format(business.getSuggestedUserTransactionInfo().getFirstTradeDate());
          } else {
            firstTradeDate = "N/A";
          }

        } else {
          annualTransactionAmount = "N/A";
          annualVolume = "N/A";
          firstTradeDate = "N/A";
        }

        list.add(new ListItem("International transfers: "));
        List subList = new List(true, false, 20);
        subList.add(new ListItem("Currency Name: " + foreignCurrency));
        subList.add(new ListItem("Annual Number of Transactions: " + annualTransactionAmount));
        subList.add(new ListItem("Estimated Annual Volume in " + foreignCurrency + ": " + annualVolume));
        subList.add(new ListItem("Anticipated First Payment Date: " + firstTradeDate));
        list.add(subList);
      }

      java.util.List<BusinessOnboarding> onboardings = businessOnBoardingSink.getArray();
      if( onboardings.size() != 0) {
        list.add(new ListItem("Compliance related timespans:"));
        List subList2 = new List(true, false, 20);
        for(BusinessOnboarding onboarding: onboardings) {
          subList2.add(new ListItem(String.format("userId: %s businessId: %s businessType: %s date: %s", onboarding.getUserId(), onboarding.getBusinessId(), business.getAddress().getCountryId(), onboarding.getCreated())));
        }
        list.add(subList2);
      }
      document.add(list);
      document.add(Chunk.NEWLINE);
      document.add(new Paragraph("Business ID: " + business.getId()));
      document.add(new Paragraph("Report Generated Date: " + reportGeneratedDate));

      document.close();
      writer.close();

      return new File(path);
    } catch (DocumentException | FileNotFoundException e) {
      logger.error(e);
    }

    return null;
  }

  /**
   * Generate a report for each signing officer in the given business.
   * @param x A context.
   * @param business A business to generate the reports for.
   * @return An array of PDFs.
   */
  private File[] generateSigningOfficersReports(X x, Business business) {
    java.util.List<User> signingOfficers = getSigningOfficers(x, business);
    File[] reports = new File[signingOfficers.size()];

    for ( int i = 0; i < signingOfficers.size(); i++ ) {
      reports[i] = generateSigningOfficer(x, business, signingOfficers.get(i), i + 1);
    }

    return reports;
  }

  /**
   * Generate a report for the given signing officer.
   * @param x A context.
   * @param business The business the given user is a signing officer for.
   * @param signingOfficer A signing officer.
   * @return A PDF report for the given signing officer.
   */
  private File generateSigningOfficer(X x, Business business, User signingOfficer, long number) {
    DAO  identificationTypeDAO  = (DAO) x.get("identificationTypeDAO");
    DAO  ipHistoryDAO           = (DAO) x.get("ipHistoryDAO");

    Logger logger = (Logger) x.get("logger");

    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
    String name = signingOfficer.getLegalName();
    String title = signingOfficer.getJobTitle();
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
    String suiteNumber = signingOfficer.getAddress().getSuite();
    String streetAddress = signingOfficer.getAddress().getStreetNumber() + " " + signingOfficer.getAddress().getStreetName();
    String city = signingOfficer.getAddress().getCity();
    String province = signingOfficer.getAddress().getRegionId();
    String country = signingOfficer.getAddress().getCountryId();
    String postalCode = signingOfficer.getAddress().getPostalCode();

    IpHistory ipHistory = (IpHistory) ipHistoryDAO.find(EQ(IpHistory.USER, signingOfficer.getId()));
    String nameOfPerson = ipHistory != null && ipHistory.findUser(x) != null ? ipHistory.findUser(x).getLegalName() : "N/A";
    String timestamp = ipHistory != null ? sdf.format(ipHistory.getCreated()) : "N/A";
    String ipAddress = ipHistory != null ? ipHistory.getIpAddress() : "N/A";

    SimpleDateFormat df = new SimpleDateFormat("yyyy/MM/dd, HH:mm:ss");
    String reportGeneratedDate = df.format(new Date());

    String path = "/tmp/ComplianceReport/[" + (business.getBusinessName()).replace("/", "") + "]SigningOfficer" + Long.toString(number) + ".pdf";

    try {
      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
      document.open();
      document.add(new Paragraph("Signing Officer Information"));

      List list = new List(List.UNORDERED);
      list.add(new ListItem("Are you the primary contact? Yes"));
      list.add(new ListItem("Are you a domestic or foreign Politically Exposed Person (PEP), " +
        "Head of an International Organization (HIO), or a close associate or family member of any such person? " + isPEPHIORelated));
      list.add(new ListItem("Name: " + name));
      list.add(new ListItem("Title: " + title));
      list.add(new ListItem("Date of birth: " + birthday));
      list.add(new ListItem("Phone number: " + phoneNumber));
      list.add(new ListItem("Email address: " + email));
      list.add(new ListItem("Suite No.: " + suiteNumber));
      list.add(new ListItem("Residential street address: " + streetAddress));
      list.add(new ListItem("City: " + city));
      list.add(new ListItem("State/Province: " + province));
      list.add(new ListItem("Country: " + country));
      list.add(new ListItem("ZIP/Postal Code: " + postalCode));

      list.add(new ListItem("Digital signature_Name of person: " + nameOfPerson));
      list.add(new ListItem("Digital signature_Timestamp: " + timestamp));
      list.add(new ListItem("Digital signature_Ip address: " + ipAddress));

      if ( null != signingOfficer.getIdentification() 
        && signingOfficer.getIdentification().getIdentificationTypeId() != 0 ) {
        IdentificationType idType = (IdentificationType) identificationTypeDAO
          .find(signingOfficer.getIdentification().getIdentificationTypeId());
        String identificationType = idType.getName();
        Region Identificationegion = (Region) ((DAO) getX().get("regionDAO")).find(signingOfficer.getIdentification().getRegionId());
        String provinceOfIssue = null == Identificationegion ? "" : Identificationegion.getName();
        Country identificationCountry = (Country) ((DAO) getX().get("countryDAO")).find(signingOfficer.getIdentification().getCountryId());
        String countryOfIssue = null == identificationCountry ? "" : identificationCountry.getName();
        String identificationNumber = signingOfficer.getIdentification().getIdentificationNumber();
        String issueDate = sdf.format(signingOfficer.getIdentification().getIssueDate());
        String expirationDate = sdf.format(signingOfficer.getIdentification().getExpirationDate());

        list.add(new ListItem("Type of identification: " + identificationType));
        if ( ! identificationType.equals("Passport") && ! SafetyUtil.isEmpty(provinceOfIssue) ) {
          list.add(new ListItem("State/Province of issue: " + provinceOfIssue));
        }
        list.add(new ListItem("Country of issue: " + countryOfIssue));
        list.add(new ListItem("Identification number: " + identificationNumber));
        list.add(new ListItem("Issue date: " + issueDate));
        list.add(new ListItem("Expiration date: " + expirationDate));
        
      }

      document.add(list);
      document.add(Chunk.NEWLINE);
      document.add(new Paragraph("Business ID: " + business.getId()));
      document.add(new Paragraph("Report Generated Date: " + reportGeneratedDate));

      document.close();
      writer.close();

      return new File(path);
    } catch (DocumentException | IOException e) {
      logger.error(e);
    }

    return null;
  }

  /** Returns a list of signing officers for a given business. */
  private java.util.List<User> getSigningOfficers(X x, Business business) {
    java.util.List<User> signingOfficers = ((ArraySink) business.getSigningOfficers(x).getDAO().select(new ArraySink())).getArray();

    return signingOfficers;
  }

  private File generateBeneficialOwners(X x, Business business) {
    Logger logger = (Logger) x.get("logger");

    String businessName = (business.getBusinessName()).replace("/", "");
    String path = "/tmp/ComplianceReport/[" + businessName + "]BeneficialOwners.pdf";

    try {
      java.util.List<BeneficialOwner> beneficialOwners = ((ArraySink) business.getBeneficialOwners(x).select(new ArraySink())).getArray();
      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
      SimpleDateFormat df = new SimpleDateFormat("yyyy/MM/dd, HH:mm:ss");
      String reportGeneratedDate = df.format(new Date());

      document.open();
      document.add(new Paragraph("Beneficial Owners Information"));
      document.add(Chunk.NEWLINE);

      if ( beneficialOwners.size() == 0 ) {
        List list = new List(List.UNORDERED);
        list.add(new ListItem("No individuals own 25% or more / Owned by a publicly traded entity"));
        document.add(list);
      } else {
        document.add(new Paragraph("The details for all beneficial owners who own 25% or more of the business are listed."));
        document.add(Chunk.NEWLINE);

        for ( int i = 0; i < beneficialOwners.size(); i++ ) {
          List list = new List(List.UNORDERED);
          BeneficialOwner beneficialOwner = beneficialOwners.get(i);
          String firstName = beneficialOwner.getFirstName();
          String lastName = beneficialOwner.getLastName();
          String jobTitle = beneficialOwner.getJobTitle();
          String percentOwnership = Integer.toString(beneficialOwner.getOwnershipPercent());
          String suiteNumber = beneficialOwner.getAddress().getSuite();
          String streetAddress = beneficialOwner.getAddress().getStreetNumber() + " " + beneficialOwner.getAddress().getStreetName();
          String city = beneficialOwner.getAddress().getCity();
          String province = beneficialOwner.getAddress().getRegionId();
          String country = beneficialOwner.getAddress().getCountryId();
          String postalCode = beneficialOwner.getAddress().getPostalCode();
          SimpleDateFormat dateOfBirthFormatter = new SimpleDateFormat("yyyy-MM-dd");
          dateOfBirthFormatter.setTimeZone(TimeZone.getTimeZone("UTC"));
          String dateOfBirth = beneficialOwner.getBirthday() != null ? dateOfBirthFormatter.format(beneficialOwner.getBirthday()) : "N/A";
          // currently we don't store the info for Ownership (direct/indirect), will add later

          document.add(new Paragraph("Beneficial Owner " + (i + 1) + ":"));
          list.add(new ListItem("First name: " + firstName));
          list.add(new ListItem("Last name: " + lastName));
          list.add(new ListItem("Job title: " + jobTitle));
          list.add(new ListItem("Percent ownership: " + percentOwnership + "%"));
          list.add(new ListItem("Suite No: " + suiteNumber));
          list.add(new ListItem("Residential street address: " + streetAddress));
          list.add(new ListItem("City: " + city));
          list.add(new ListItem("State/Province: " + province));
          list.add(new ListItem("Country: " + country));
          list.add(new ListItem("ZIP/Postal Code: " + postalCode));
          list.add(new ListItem("Date of birth: " + dateOfBirth));
          document.add(list);
          document.add(Chunk.NEWLINE);
        }
      }

      document.add(Chunk.NEWLINE);
      document.add(new Paragraph("Business ID: " + business.getId()));
      document.add(new Paragraph("Report Generated Date: " + reportGeneratedDate));

      document.close();
      writer.close();

      return new File(path);
    } catch (DocumentException | IOException e) {
      logger.error(e);
    }

    return null;
  }

  private File generateCompanyDirectorsList(X x, Business business) {
    if ( null == business ) return null;
    Logger logger = (Logger) x.get("logger");
    String path = "/tmp/ComplianceReport/[" + (business.getBusinessName()).replace("/", "") + "]Directors.pdf";
    try {
      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
      document.open();
      document.add(new Paragraph("Company Directors"));

      document.add(Chunk.NEWLINE);
      List list = new List(List.UNORDERED);
      for ( int i = 0; i < business.getBusinessDirectors().length; i++ ) {
        BusinessDirector businessDirector = (BusinessDirector) business.getBusinessDirectors()[i];
        list.add(new ListItem(businessDirector.getFirstName() + " " + businessDirector.getLastName()));
      }
      document.add(list);
      document.add(Chunk.NEWLINE);
      document.close();
      writer.close();

      return new File(path);

    } catch (DocumentException | IOException e) {
      logger.error(e);
    }
    return null;
  }

  private File generateBankInfo(X x, Business business) {
    DAO  accountDAO        = (DAO) x.get("accountDAO");
    DAO  branchDAO         = (DAO) x.get("branchDAO");
    DAO  institutionDAO    = (DAO) x.get("institutionDAO");
    DAO  flinksResponseDAO = (DAO) x.get("flinksAccountsDetailResponseDAO");

    Logger logger = (Logger) x.get("logger");

    SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd, HH:mm:ss");
    sdf.setTimeZone(TimeZone.getTimeZone("UTC"));

    String businessName = (business.getBusinessName()).replace("/", "");

    BankAccount bankAccount = (BankAccount) accountDAO.orderBy(DESC(BankAccount.CREATED))
      .find(AND(
        INSTANCE_OF(BankAccount.getOwnClassInfo()),
        EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
        EQ(Account.OWNER, business.getId())));

    if ( bankAccount == null ) {
      return null;
    }

    String path = "/tmp/ComplianceReport/[" + businessName + "]BankInfo.pdf";

    try {
      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));
      document.open();
      document.add(new Paragraph("Bank Information"));

      Branch branch = (Branch) branchDAO.find(bankAccount.getBranch());
      String branchNum;
      if ( branch != null ) {
        branchNum = branch.getBranchId();
      } else {
        branchNum = "N/A";
      }

      String accountNum = bankAccount.getAccountNumber();
      String accountName = bankAccount.getName();
      String accountCurrency = bankAccount.getDenomination();
      String companyName = business.getBusinessName();
      String operatingName = business.getOperatingBusinessName();

      java.util.List<User> signingOfficers = getSigningOfficers(x, business);
      StringBuilder signingOfficerNames = new StringBuilder();
      for ( int i = 0; i < signingOfficers.size(); i++ ) {
        signingOfficerNames.append(signingOfficers.get(i).getLegalName());
        if ( i + 1 < signingOfficers.size() ) {
          signingOfficerNames.append(", ");
        }
      }

      long randomDepositAmount = bankAccount.getRandomDepositAmount();
      Date microVerificationTimestamp = bankAccount.getMicroVerificationTimestamp();
      SimpleDateFormat rgdf = new SimpleDateFormat("yyyy/MM/dd, HH:mm:ss");
      String reportGeneratedDate = rgdf.format(new Date());

      List list = new List(List.UNORDERED);
      list.add(new ListItem("Account name: " + accountName));
      // It is unnecessary to show institution number for US bank accounts
      if ( accountCurrency.equals("USD") ) {
        list.add(new ListItem("Routing number: " + branchNum));
      } else {
        Institution institution = (Institution) institutionDAO.find(bankAccount.getInstitution());
        String institutionNum;
        if ( institution != null ) {
          institutionNum = institution.getInstitutionNumber();
        } else {
          institutionNum = "N/A";
        }
        list.add(new ListItem("Transit number: " + branchNum));
        list.add(new ListItem("Institution number: " + institutionNum));
      }
      list.add(new ListItem("Account number: " + accountNum));
      list.add(new ListItem("Account currency: " + accountCurrency));
      list.add(new ListItem("Company name: " + companyName));
      if ( operatingName.length() != 0) {
        list.add(new ListItem("Operating name: " + operatingName));
      }
      list.add(new ListItem("Signing officer names: " + signingOfficerNames));

      if ( bankAccount instanceof CABankAccount ) {
        CABankAccount caBankAccount = (CABankAccount) bankAccount;
        if ( microVerificationTimestamp != null ) { // micro-deposit
          DecimalFormat df = new DecimalFormat("0.00");
          String depositAmount = df.format((double)randomDepositAmount / 100);
          list.add(new ListItem("Amount sent in the micro-deposit: $" + depositAmount));
          Date createDate = caBankAccount.getCreated();
          String verification = sdf.format(microVerificationTimestamp);
          String bankAddedDate = sdf.format(createDate);
          list.add(new ListItem("Micro transaction verification date: " + verification));
          list.add(new ListItem("PAD agreement date: " + bankAddedDate));
        } else { // flinks
          FlinksAccountsDetailResponse flinksAccountInformation = (FlinksAccountsDetailResponse) flinksResponseDAO.find(
            EQ(FlinksAccountsDetailResponse.USER_ID, business.getId())
          );
          Date createDate = caBankAccount.getCreated();
          String dateOfValidation = sdf.format(createDate);
          String flinksRequestId = flinksAccountInformation !=  null ? flinksAccountInformation.getRequestId() : "N/A";
          list.add(new ListItem("Validated by Flinks at: " + dateOfValidation));
          list.add(new ListItem("Flink response ID: " + flinksRequestId));
        }
      } else if ( bankAccount instanceof USBankAccount) {
        USBankAccount usBankAccount = (USBankAccount) bankAccount;
        Date createDate = usBankAccount.getCreated();
        String bankAddedDate = sdf.format(createDate);
        list.add(new ListItem("PAD agreement date: " + bankAddedDate));
        this.getPlaidDetails(x, (USBankAccount) bankAccount, list);
      }

      document.add(list);
      document.add(Chunk.NEWLINE);
      document.add(new Paragraph("Business ID: " + business.getId()));
      document.add(new Paragraph("Report Generated Date: " + reportGeneratedDate));

      document.close();
      writer.close();

      return new File(path);
    } catch (DocumentException | FileNotFoundException e) {
      logger.error(e);
    }

    return null;
  }


  private void getPlaidDetails(X x, USBankAccount bankAccount, List list) {
    DAO plaidReportDAO = (DAO) x.get("plaidResultReportDAO");

    PlaidResultReport report
      = (PlaidResultReport) plaidReportDAO.inX(x).find(EQ(PlaidResultReport.NANOPAY_ACCOUNT_ID, bankAccount.getId()));

    if ( report != null ) {
      list.add(new ListItem("Plaid Id: " + report.getPlaidId()));
      list.add(new ListItem("Account Holder Name: " + report.getAccountHolderName()));
      list.add(new ListItem("Date of validation: " + report.getValidationDate()));
      list.add(new ListItem("IP address: " + report.getIp()));
    }
  }


  private File getBusinessDoc(X x, Business business) {
    Logger logger = (Logger) x.get("logger");

    String businessName = (business.getBusinessName()).replace("/", "");
    String path;
    Blob blob;
    try {
      foam.nanos.fs.File[] businessFiles = business.getAdditionalDocuments();
      if ( businessFiles != null && businessFiles.length > 0 ) {
        foam.nanos.fs.File businessFile = businessFiles[0];

        String blobId = ((IdentifiedBlob) businessFile.getData()).getId();
        blob = getDelegate().find_(x, blobId);

        long size = businessFile.getFilesize();
        String fileName = businessFile.getFilename();
        String fileType = fileName.substring(fileName.lastIndexOf("."));

        path = "/tmp/ComplianceReport/[" + businessName + "]BusinessDoc" + fileType;
        OutputStream os = new FileOutputStream(path);

        blob.read(os, 0, size);

        return new File(path);
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }

  /**
   * Returns the identification files uploaded for the signing officers in the
   * given business.
   */
  private File[] getSigningOfficerIDs(X x, Business business) {
    java.util.List<User> signingOfficers = getSigningOfficers(x, business);
    File[] files = new File[signingOfficers.size()];

    for ( int i = 0; i < signingOfficers.size(); i++ ) {
      files[i] = getSigningOfficerID(x, business, signingOfficers.get(i), i + 1);
    }

    return files;
  }

  private File getSigningOfficerID(X x, Business business, User so, int number) {
    Logger logger  = (Logger) x.get("logger");
    String businessName = (business.getBusinessName()).replace("/", "");
    String path;
    Blob blob;

    try {
      foam.nanos.fs.File[] signingOfficerFiles = so.getAdditionalDocuments();
      if ( signingOfficerFiles != null && signingOfficerFiles.length > 0 ) {
        foam.nanos.fs.File signingOfficerFile = signingOfficerFiles[0];

        String blobId = ((IdentifiedBlob) signingOfficerFile.getData()).getId();
        blob = getDelegate().find_(x, blobId);

        long size = signingOfficerFile.getFilesize();
        String fileName = signingOfficerFile.getFilename();
        String fileType = fileName.substring(fileName.lastIndexOf("."));

        path = "/tmp/ComplianceReport/[" + businessName + "]SigningOfficer" + Long.toString(number) + "ID" + fileType;
        OutputStream os = new FileOutputStream(path);

        blob.read(os, 0, size);

        return new File(path);
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }


  private File getBeneficialOwnersDoc(X x, Business business) {
    Logger logger = (Logger) x.get("logger");

    String businessName = (business.getBusinessName()).replace("/", "");

    String path;
    Blob blob;
    try {
      foam.nanos.fs.File[] beneficialOwnerFiles = business.getBeneficialOwnerDocuments();

      if ( beneficialOwnerFiles != null && beneficialOwnerFiles.length > 0 ) {
        foam.nanos.fs.File beneficialOwnerFile = beneficialOwnerFiles[0];

        String blobId = ((IdentifiedBlob) beneficialOwnerFile.getData()).getId();
        blob = getDelegate().find_(x, blobId);

        long size = beneficialOwnerFile.getFilesize();
        String fileName = beneficialOwnerFile.getFilename();
        String fileType = fileName.substring(fileName.lastIndexOf("."));

        path = "/tmp/ComplianceReport/[" + businessName + "]BeneficialOwnersDoc" + fileType;
        OutputStream os = new FileOutputStream(path);

        blob.read(os, 0, size);

        return new File(path);
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }


  private File getUSBankAccountProof(X x, Business business) {
    DAO    accountDAO  = (DAO) x.get("accountDAO");
    Logger logger      = (Logger) x.get("logger");
    DAO plaidReportDAO = (DAO) x.get("plaidResultReportDAO");

    BankAccount bankAccount = (BankAccount) accountDAO.orderBy(DESC(BankAccount.CREATED))
      .find(AND(
        INSTANCE_OF(BankAccount.getOwnClassInfo()),
        EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
        EQ(Account.OWNER, business.getId())));

    PlaidResultReport report
      = (PlaidResultReport) plaidReportDAO.inX(x).find(EQ(PlaidResultReport.NANOPAY_ACCOUNT_ID, bankAccount.getId()));

    // if it's imported from plaid, then no bank account proof file.
    if ( report != null ) {
      return null;
    }

    String businessName = (business.getBusinessName()).replace("/", "");
    String path;
    Blob blob;
    try {
      if ( bankAccount instanceof USBankAccount) {


        USBankAccount usBankAccount = (USBankAccount) bankAccount;
        foam.nanos.fs.File voidCheckImage = usBankAccount.getVoidCheckImage();
        String blobId = ((IdentifiedBlob) voidCheckImage.getData()).getId();
        blob = getDelegate().find_(x, blobId);

        long size = voidCheckImage.getFilesize();
        String fileName = voidCheckImage.getFilename();
        String fileType = fileName.substring(fileName.lastIndexOf("."));

        path = "/tmp/ComplianceReport/[" + businessName + "]BankAccountProof" + fileType;
        OutputStream os = new FileOutputStream(path);

        blob.read(os, 0, size);

        return new File(path);
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }


  private void downloadZipFile(X x, Business business, File[] srcFiles) {
    HttpServletResponse response = x.get(HttpServletResponse.class);
    Logger              logger   = (Logger) x.get("logger");

    response.setContentType("multipart/form-data");

    String businessName = (business.getBusinessName()).replace("/", "");
    String downloadName = "[" + businessName + "]ComplianceDocs.zip";

    response.setHeader("Content-Disposition", "attachment;fileName=\"" + downloadName + "\"");

    DataOutputStream os = null;
    ZipOutputStream zipos = null;
    try {
      zipos = new ZipOutputStream(new BufferedOutputStream(response.getOutputStream()));
      zipos.setMethod(ZipOutputStream.DEFLATED);

      for (File file : srcFiles) {
        if ( file == null ) {
          continue;
        }

        zipos.putNextEntry(new ZipEntry(file.getName()));
        os = new DataOutputStream(zipos);
        InputStream is = new FileInputStream(file);
        byte[] b = new byte[100];
        int length;
        while((length = is.read(b))!= -1){
          os.write(b, 0, length);
        }
        is.close();
        zipos.closeEntry();
        os.flush();
      }
    } catch (Exception e) {
      logger.error(e);
    } finally {
      IOUtils.closeQuietly(os);
      IOUtils.closeQuietly(zipos);
    }
  }
}
