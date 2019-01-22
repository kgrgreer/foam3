package net.nanopay.fx.ascendantfx;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import net.nanopay.meter.IpHistory;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessSector;
import net.nanopay.model.BusinessType;
import net.nanopay.model.IdentificationType;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class AscendantFXHTMLGenerator {

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

