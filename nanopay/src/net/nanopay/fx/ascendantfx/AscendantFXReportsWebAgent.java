package net.nanopay.fx.ascendantfx;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.IdentifiedBlob;
import foam.blob.ProxyBlobService;
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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

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
    DAO    businessTypeDAO   = (DAO) x.get("businessTypeDAO");
    DAO    agentJunctionDAO  = (DAO) x.get("agentJunctionDAO");
    DAO    fileDAO           = (DAO) x.get("fileDAO");

    HttpServletRequest req     = x.get(HttpServletRequest.class);

    String id = req.getParameter("userId");
    System.out.println("id:" + id);

    User user = (User) userDAO.find(id);
    Business business;

    if ( user instanceof Business ) {
      business = (Business) user;
    } else {
      UserUserJunction userUserJunction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user.getId()));
      business = (Business) userDAO.find(userUserJunction.getTargetId());
    }



//    Blob blob;
//    try {
//      foam.nanos.fs.File[] businessFiles = business.getAdditionalDocuments();
//      for ( foam.nanos.fs.File businessFile : businessFiles ) {
//        String fileName = businessFile.getFilename();
//        String blobId = ((IdentifiedBlob) businessFile.getData()).getId();
//        blob = getDelegate().find_(x, blobId);
//
//
//        Long size = businessFile.getFilesize();
//        // long size = blob.getSize();
//
//        //foam.nanos.fs.File file = (foam.nanos.fs.File) fileDAO.find(((IdentifiedBlob) businessFile.getData()).getId());
//
//        DataOutputStream dos = new DataOutputStream(new FileOutputStream("/opt/nanopay/temp/" + fileName));
//
//        //OutputStream os = new FileOutputStream("/opt/nanopay/temp/" + fileName);
//
//        blob.read(dos, 0, size);
//      }
//    } catch (IOException e) {
//      e.printStackTrace();
//    }


    File companyInfo = generateCompanyInfo(x, business, id);
    File signingOfficer = generateSigningOfficer(x, business, id);
    File beneficialOwners = generateBeneficialOwners(x, business, id);
    File businessDoc = getBusinessDoc(x, business);

//    File companyInfo = new File("/opt/nanopay/temp/CompanyInfo.pdf");
//    File signingOfficerInfo = new File("/opt/nanopay/temp/SigningOfficerInfo.pdf");
//    File BeneficialOwners = new File("/opt/nanopay/temp/BeneficialOwners.pdf");


    File[] srcFiles = new File[]{companyInfo, signingOfficer, beneficialOwners, businessDoc};

    downloadFiles(x, business, srcFiles);
  }


  public File generateCompanyInfo(X x, Business business, String id) {
    DAO userDAO           = (DAO) x.get("localUserDAO");
    DAO    businessTypeDAO   = (DAO) x.get("businessTypeDAO");
    DAO    businessSectorDAO = (DAO) x.get("businessSectorDAO");

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

    String path = "/opt/nanopay/AFXReportsTemp/[" + businessName + "]CompanyInfo.pdf";

    try {
      Document document = new Document();

      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));

      // PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream("/opt/nanopay/temp/CompanyInfo.pdf"));

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
      list.add(new ListItem("Industry: " + industry + " (" + businessSector.getId() + ")"));
      list.add(new ListItem("Are you taking instructions from and/or conducting transactions on behalf of a 3rd party? " + isThirdParty));
      list.add(new ListItem("Who do you market your products and services to? " + targetCustomers));
      list.add(new ListItem("Source of Funds (Where did you acquire the funds used to pay us?): " + sourceOfFunds));
      list.add(new ListItem("Is this a holding company? " + isHoldingCompany));
      list.add(new ListItem("Annual gross sales in your base currency: " + annualRevenue));
      list.add(new ListItem("Base currency: " + baseCurrency));
      list.add(new ListItem("International transfers: "));

      List subList = new List(true, false, 20);
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
    } catch (DocumentException | FileNotFoundException e) {
      e.printStackTrace();
    }

    return new File(path);
  }


  private File generateSigningOfficer(X x, Business business, String id) {
    DAO  userDAO                = (DAO) x.get("localUserDAO");
    DAO  identificationTypeDAO  = (DAO) x.get("identificationTypeDAO");
    DAO  ipHistoryDAO           = (DAO) x.get("ipHistoryDAO");

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

    String path = "/opt/nanopay/AFXReportsTemp/[" + businessName + "]SigningOfficer.pdf";

    try {
      Document document = new Document();

      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));

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
    } catch (DocumentException | IOException e) {
      e.printStackTrace();
    }

    return new File(path);
  }


  public File generateAuthorizedUserInfo(X x, String id) {
    // None for now
    return null;
  }


  private File generateBeneficialOwners(X x, Business business, String userId) {
    String businessName = business.getBusinessName();
    String path = "/opt/nanopay/AFXReportsTemp/[" + businessName + "]BeneficialOwners.pdf";

    User[] beneficialOwners = business.getPrincipalOwners();
    try {
      Document document = new Document();

      PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(path));

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
    } catch (DocumentException | IOException e) {
      e.printStackTrace();
    }

    return new File(path);
  }


  private File getBusinessDoc(X x, Business business) {
    String businessName = business.getBusinessName();
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

        path = "/opt/nanopay/AFXReportsTemp/[" + businessName + "]BusinessDoc" + fileType;
        OutputStream os = new FileOutputStream(path);

        blob.read(os, 0, size);

        return new File(path);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    return null;
  }


  private void downloadFiles(X x, Business business, File[] srcFiles) {
    HttpServletResponse response = x.get(HttpServletResponse.class);
    response.setContentType("multipart/form-data");

    String businessName = business.getBusinessName();
    String downloadName = "[" + businessName + "]ComplianceDocs.zip";

    response.setHeader("Content-Disposition", "attachment;fileName=\"" + downloadName + "\"");

    ZipOutputStream zipos = null;
    try {
      zipos = new ZipOutputStream(new BufferedOutputStream(response.getOutputStream()));
      zipos.setMethod(ZipOutputStream.DEFLATED);
    } catch (Exception e) {
      e.printStackTrace();
    }

    DataOutputStream os = null;

    for (File file : srcFiles) {
      try {
        zipos.putNextEntry(new ZipEntry(file.getName()));
        os = new DataOutputStream(zipos);
        InputStream is = new FileInputStream(file);
        byte[] b = new byte[100];
        int length = 0;
        while((length = is.read(b))!= -1){
          os.write(b, 0, length);
        }
        is.close();
        zipos.closeEntry();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    try {
      os.flush();
      os.close();
      zipos.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
