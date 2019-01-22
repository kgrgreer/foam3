package net.nanopay.fx.ascendantfx;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.http.WebAgent;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessSector;
import net.nanopay.model.BusinessType;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;

import static foam.mlang.MLang.EQ;

public class AscendantFXReportsWebAgent implements WebAgent {

  @Override
  public void execute(X x) {
    HttpServletRequest req     = x.get(HttpServletRequest.class);

    String userId = req.getParameter("userId");
    System.out.println("id:" + userId);

    generateCompanyInfo(x, userId);
  }

  public void generateCompanyInfo(X x, String userId) {
    DAO userDAO           = (DAO) x.get("localUserDAO");
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
      subList.add(new ListItem("Industry: " + industry));
      list.add(subList);

      document.add(list);
      document.close();
      writer.close();

      HttpServletResponse response = x.get(HttpServletResponse.class);

      response.setContentType("application/pdf");
      response.setHeader("Content-disposition", "attachment; filename=\"testaaaaa");

      ServletOutputStream out = response.getOutputStream();
      baos.writeTo(out);
      out.flush();
    } catch (DocumentException | IOException e) {
      e.printStackTrace();
    }
  }
}
