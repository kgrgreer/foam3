package net.nanopay.fx.ascendantfx;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.http.WebAgent;
import net.nanopay.meter.IpHistory;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessSector;
import net.nanopay.model.BusinessType;
import net.nanopay.model.IdentificationType;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class AscendantFXReportsWebAgent implements WebAgent {

  @Override
  public void execute(X x) {
    HttpServletRequest req     = x.get(HttpServletRequest.class);

    String id = req.getParameter("userId");
    System.out.println("id:" + id);

    // generateCompanyInfo(x, id);
    // generateSigningOfficerInfo(x, id);
    generateBeneficialOwners(x, id);
  }

  public void generateCompanyInfo(X x, String id) {
    DAO userDAO           = (DAO) x.get("localUserDAO");
    DAO    businessTypeDAO   = (DAO) x.get("businessTypeDAO");
    DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
    DAO    businessSectorDAO = (DAO) x.get("businessSectorDAO");

    User user = (User) userDAO.find(id);
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

    try {
      System.out.println(111);

      ByteArrayOutputStream baos = new ByteArrayOutputStream();

      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, baos);

      document.open();

      document.add(new Paragraph("Company Information"));

      List list = new List(List.UNORDERED);
      list.add(new ListItem("Type of Business: " + businessType));
      list.add(new ListItem("Legal Name of Business: " + businessName));
      list.add(new ListItem("Operating Name: " + operatingName));
      list.add(new ListItem("Street Address: " + streetAddress));
      list.add(new ListItem("City: " + city));
      list.add(new ListItem("State/Province: " + Province));
      list.add(new ListItem("ZIP/Postal Code: " + postalCode));
      list.add(new ListItem("Business Phone Number: " + businessPhoneNumber));
      list.add(new ListItem("Industry: " + industry));
      list.add(new ListItem("Are you taking instructions from and/or conducting transactions on behalf of a 3rd party? " + isThirdParty));
      list.add(new ListItem("Who do you market your products and services to? " + targetCustomers));
      list.add(new ListItem("Source of Funds (Where did you acquire the funds used to pay us?): " + sourceOfFunds));
      list.add(new ListItem("Is this a holding company? " + isHoldingCompany));
      list.add(new ListItem("Annual gross sales in your base currency: " + annualRevenue));
      list.add(new ListItem("Base currency: " + baseCurrency));
      list.add(new ListItem("International transfers: "));

      List subList = new List(true, false, 30);
      subList.add(new ListItem("Currency Name: " + foreignCurrency));
      subList.add(new ListItem("Purpose of Transactions: " + purposeOfTransactions));
      subList.add(new ListItem("Annual Number of Transactions: " + annualTransactionAmount));
      subList.add(new ListItem("Estimated Annual Volume in " + foreignCurrency + ": " + annualVolume));
      subList.add(new ListItem("Anticipated First Payment Date: " + firstTradeDate));
      subList.add(new ListItem("Industry: " + industry));
      list.add(subList);

      document.add(list);
      document.close();
      writer.close();

      HttpServletResponse response = x.get(HttpServletResponse.class);

      response.setContentType("application/pdf");
      response.setHeader("Content-disposition", "attachment; filename=\"Company Information");

      ServletOutputStream out = response.getOutputStream();
      baos.writeTo(out);
      out.flush();
    } catch (DocumentException | IOException e) {
      e.printStackTrace();
    }
  }


  public void generateSigningOfficerInfo(X x, String id) {
    DAO  userDAO                = (DAO) x.get("localUserDAO");
    DAO  identificationTypeDAO  = (DAO) x.get("identificationTypeDAO");
    DAO  agentJunctionDAO       = (DAO) x.get("agentJunctionDAO");
    DAO ipHistoryDAO            = (DAO) x.get("ipHistoryDAO");

    User user = (User) userDAO.find(id);
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

    try {
      System.out.println(222);

      ByteArrayOutputStream baos = new ByteArrayOutputStream();

      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, baos);

      document.open();

      document.add(new Paragraph("Signing Officer Information"));

      List list = new List(List.UNORDERED);
      list.add(new ListItem("Are you the primary contact? Yes"));
      list.add(new ListItem("Are you a director of the company? " + isDirector));
      list.add(new ListItem("Are you a domestic or foreign Politically Exposed Person (PEP), " +
        "Head of an International Organization (HIE), or a close associate or family member of any such person? " + isPEPHIORelated));
      list.add(new ListItem("Name: " + name));
      list.add(new ListItem("Title: " + title));
      list.add(new ListItem("Date of birth: " + birthday));
      list.add(new ListItem("Phone number: " + phoneNumber));
      list.add(new ListItem("Email address: " + email));
      list.add(new ListItem("Residential street address: " + streetAddress));
      list.add(new ListItem("City: " + city));
      list.add(new ListItem("State/Province: " + province));
      list.add(new ListItem("ZIP/Postal Code: " + postalCode));
      list.add(new ListItem("Type of identification: " + identificationType));
      list.add(new ListItem("State/Province of issue: " + provinceOfIssue));
      list.add(new ListItem("Country of issue: " + countryOfIssue));
      list.add(new ListItem("Identification number: " + identificationNumber));
      list.add(new ListItem("Issue date: " + issueDate));
      list.add(new ListItem("Expiration date: " + expirationDate));
      list.add(new ListItem("Digital signature_Name of person: " + nameOfPerson));
      list.add(new ListItem("Digital signature_Timestamp: " + timestamp));
      list.add(new ListItem("Digital signature_Ip address: " + ipAddress));

      document.add(list);
      document.close();
      writer.close();

      HttpServletResponse response = x.get(HttpServletResponse.class);

      response.setContentType("application/pdf");
      response.setHeader("Content-disposition", "attachment; filename=\"Signing Officer Information");

      ServletOutputStream out = response.getOutputStream();
      baos.writeTo(out);
      out.flush();
    } catch (DocumentException | IOException e) {
      e.printStackTrace();
    }
  }


  public void generateAuthorizedUserInfo(X x, String id) {
    // None for now
  }


  public void generateBeneficialOwners(X x, String userId) {
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

    try {
      System.out.println(333);

      ByteArrayOutputStream baos = new ByteArrayOutputStream();

      Document document = new Document();
      PdfWriter writer = PdfWriter.getInstance(document, baos);

      document.open();
      document.add(new Paragraph("Beneficial Owners Information"));

      if ( beneficialOwners.length == 0 ) {
        List list = new List(List.UNORDERED);
        list.add(new ListItem("No individuals own 25% or more / Owned by a publicly traded entity"));
        document.add(list);
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

          document.add(new Paragraph("Beneficial Owner " + (i + 1) + ":"));
          List list = new List(List.UNORDERED);
          //list.add(new ListItem("Beneficial Owner " + (i + 1) + ":"));
          list.add(new ListItem("First name: " + firstName));
          list.add(new ListItem("Last name: " + lastName));
          list.add(new ListItem("Job title: " + jobTitle));
          list.add(new ListItem("Principal type: " + principalType));
          list.add(new ListItem("Residential street address: " + streetAddress));
          list.add(new ListItem("City: " + city));
          list.add(new ListItem("State/Province: " + province));
          list.add(new ListItem("ZIP/Postal Code: " + postalCode));
          document.add(list);
        }
      }

      document.close();
      writer.close();

      HttpServletResponse response = x.get(HttpServletResponse.class);

      response.setContentType("application/pdf");
      response.setHeader("Content-disposition", "attachment; filename=\"Beneficial Owners Information");

      ServletOutputStream out = response.getOutputStream();
      baos.writeTo(out);
      out.flush();
    } catch (DocumentException | IOException e) {
      e.printStackTrace();
    }
  }
}
