// ============ Business Information Report for Marketing team =============
// Summary table index would be: 
// Business ID | Sign Up Date | Sign Up Time | Country of Origin | Compliance Status

// Use the following script to run the report:
// import net.nanopay.meter.reports.ReportBusinessInformation;
// rbi == new ReportBusinessInformation();
// report = rbi.createReport(x);
// print (report);

package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.auth.Address;
import net.nanopay.model.Business;
import java.util.List;

public class ReportBusinessInformation {

  public String createReport(X x) {
    final String COMMA_SEPARATOR = ", ";

    DAO businessDAO = (DAO) x.get("businessDAO");

    List businesses = ((ArraySink) businessDAO.select(new ArraySink())).getArray();

    // Setup the column headers for the Business
    StringBuilder businessDetailBuffer = new StringBuilder();
    businessDetailBuffer.append("Business ID, Sign Up Date, Country of Origin, Compliance Status");
    businessDetailBuffer.append(System.getProperty("line.separator"));

    for (Object b : businesses ) {
      Business business = (Business) b;
      Address address = business.getAddress();

      businessDetailBuffer
        .append("Business ID: " + business.getId()).append(COMMA_SEPARATOR)
        .append("Sign Up Date: " + business.getCreated()).append(COMMA_SEPARATOR)
        .append("Country of Origin: " + address.getCountryId()).append(COMMA_SEPARATOR)
        .append("Compliance Status: " + business.getCompliance())
        .append(System.getProperty("line.separator"));
    }

    return businessDetailBuffer.toString();
  }
}