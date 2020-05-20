package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.nanos.auth.Address;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.model.Business;
import java.util.List;

// User summary report for users who have passed complaince
// Used for Dow Jones integration
public class ReportDowJonesUserCheck {

  public String createReport(X x) {

  final String COMMA_SEPARATOR = ",";

  DAO userDAO = (DAO) x.get("userDAO");

  List users = ((ArraySink) userDAO.where(
    MLang.EQ(User.COMPLIANCE, ComplianceStatus.PASSED)
  ).select(new ArraySink())).getArray();

  // Setup the column headers for the User Summary
  StringBuilder userDetailBuffer = new StringBuilder();
  userDetailBuffer.append("Row Action, Case ID, Case Name, Case Owner, Requestor, Phone, Email, Priority, Segment, Comment, Case Status, Match Relationship, Relationship Type, Relationship ID, Relationship Name, First Name, Middle Name, Surname, Gender, Date of Birth, Alternative Name, Occupation, Identification Type, Identification Value, Notes 1, Notes 2, Association Type, Industry Sector, Screening, Priority, Document Links, Country, Address Line, Address URL, Phone, City, State, Postal Code, Service - DJ R&C, Service - DJ News");
  userDetailBuffer.append(System.getProperty("line.separator"));

  // List all users that have passed complaince
  for ( Object u : users ) {
    User user = (User) u;
    Address address = user.getAddress();

    userDetailBuffer
      .append("Insert").append(COMMA_SEPARATOR) // Row Action
      .append("User : " + user.getId()).append(COMMA_SEPARATOR) // Case ID
      .append(user.getOrganization() != null ? user.getOrganization() : "").append(COMMA_SEPARATOR) // Case Name
      .append("Michael Shin").append(COMMA_SEPARATOR) // Case Owner
      .append("M Shin").append(COMMA_SEPARATOR) // Requestor
      .append("416 900 1111").append(COMMA_SEPARATOR) // Phone
      .append("michael@nanopay.net").append(COMMA_SEPARATOR) // Email
      .append("Medium").append(COMMA_SEPARATOR) // Priority
      .append("nanopay - Default").append(COMMA_SEPARATOR) // Segment
      .append("").append(COMMA_SEPARATOR) // Comment
      .append("Submitted").append(COMMA_SEPARATOR) // Case Status
      .append("").append(COMMA_SEPARATOR) // Match Relationship
      .append(user instanceof Business ? "Entity" : "Individual").append(COMMA_SEPARATOR) // Relationship Type
      .append("User : " + user.getId()).append(COMMA_SEPARATOR) // Relationship ID
      .append(user.getOrganization()).append(COMMA_SEPARATOR) // Relationship Name
      .append(user.getFirstName()).append(COMMA_SEPARATOR) // First Name
      .append(user.getMiddleName()).append(COMMA_SEPARATOR) // Middle Name
      .append(user.getLastName()).append(COMMA_SEPARATOR) // Last Name
      .append(user.getBirthday()).append(COMMA_SEPARATOR) // Date of Birth
      .append("").append(COMMA_SEPARATOR) // Alternative Name
      .append(user.getJobTitle()).append(COMMA_SEPARATOR) // Occupation
      .append(address.getCountryId()).append(COMMA_SEPARATOR) // Identification Type
      .append(address.getRegionId()).append(COMMA_SEPARATOR) // Identification Value
      .append("").append(COMMA_SEPARATOR) // Notes 1
      .append("").append(COMMA_SEPARATOR) // Notes 2
      .append("").append(COMMA_SEPARATOR) // Association Type
      .append("").append(COMMA_SEPARATOR) // Industry Sector
      .append("").append(COMMA_SEPARATOR) // Screening
      .append("").append(COMMA_SEPARATOR) // Priority
      .append("").append(COMMA_SEPARATOR) // Document Links
      .append(address.getCountryId()).append(COMMA_SEPARATOR) // Country
      .append(address.getSuite()).append(COMMA_SEPARATOR) // Address Line
      .append(address.getStreetNumber() + " " + address.getStreetName()).append(COMMA_SEPARATOR) // Address URL
      .append(user.getPhoneNumber()).append(COMMA_SEPARATOR) // Phone
      .append(address.getCity()).append(COMMA_SEPARATOR) // City
      .append(address.getRegionId()).append(COMMA_SEPARATOR) // State
      .append(address.getPostalCode()).append(COMMA_SEPARATOR) // Postal Code
      .append("yes").append(COMMA_SEPARATOR) // Service - DJ R&C
      .append("no").append(COMMA_SEPARATOR) // Service - DJ News
      .append(System.getProperty("line.separator"));
  }

  return userDetailBuffer.toString();
}}
