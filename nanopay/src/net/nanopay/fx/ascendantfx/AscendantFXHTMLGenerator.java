package net.nanopay.fx.ascendantfx;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import net.nanopay.meter.IpHistory;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessSector;
import net.nanopay.model.BusinessType;
import net.nanopay.model.IdentificationType;

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
}
