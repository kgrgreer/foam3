package net.nanopay.onboarding;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.*;
import foam.mlang.MLang;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.util.SafetyUtil;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.model.Business;
import net.nanopay.model.PersonalIdentification;
import net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;

public class BusinessOnboardingValidator implements Validator {


  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
    Business business = (Business) obj;

    // This validator is used when the user completing the business profile.
    // This validation will only occurs when the compliance status set to requested.
    if ( business.getCompliance() == ComplianceStatus.REQUESTED ) {

      // 1. business profile
      this.validateBusinessProfile(business);

      // 2. transaction info
      this.validateTransactionInfo(business);

      // 3. signing officer
      validateSigningOfficer(x, business);

      // 4. Principal owners
      this.validatePrincipalOwners(business);

    }
  }

  public void validateBusinessProfile(Business business) {

    // organization name
    if ( SafetyUtil.isEmpty(business.getOrganization()) ) {
      throw new RuntimeException("Business name required.");
    }

    // phone number
    if ( business.getBusinessPhone() == null ) {
      throw new RuntimeException("Business phone required");
    }

    // address
    Address businessAddress = business.getBusinessAddress();
    if ( businessAddress == null ) {
      throw new RuntimeException("Business Address required.");
    }
    BusinessOnboardingValidator.validateAddress(businessAddress);

    // tax identification number
    if ( business.getAddress().getCountryId().equals("US") ) {
      if ( SafetyUtil.isEmpty(business.getTaxIdentificationNumber()) ) {
        throw new RuntimeException("Tax Identification Number is required.");
      }

      if ( business.getTaxIdentificationNumber().length() != 9 ) {
        throw new RuntimeException("Tax Identification Number should be 9 digits.");
      }
    }

    // additional documents
    if ( business.getAdditionalDocuments().length <= 0 ) {
      throw new RuntimeException("Please upload at least one proof of registration file for your business type.");
    }

  }

  public void validateTransactionInfo(Business business) {
    SuggestedUserTransactionInfo transactionInfo =
      business.getSuggestedUserTransactionInfo();

    if ( transactionInfo == null ) {
      throw new RuntimeException("Transaction info is required.");
    }

    if ( SafetyUtil.isEmpty(transactionInfo.getBaseCurrency()) ) {
      throw new RuntimeException("Base currency required.");
    }

    if ( SafetyUtil.isEmpty(transactionInfo.getAnnualRevenue()) ) {
      throw new RuntimeException("Annual revenue required.");
    }

    if ( SafetyUtil.isEmpty(transactionInfo.getTransactionPurpose()) ) {
      throw new RuntimeException("Transaction purpose required.");
    }

    if ( transactionInfo.getInternationalPayments() ) {
      if ( SafetyUtil.isEmpty(transactionInfo.getAnnualTransactionAmount()) ) {
        throw new RuntimeException("Annual transaction required.");
      }

      if (SafetyUtil.isEmpty(transactionInfo.getAnnualVolume()) ) {
        throw new RuntimeException("Annual volume required.");
      }
    }
  }

  public void validatePrincipalOwners(Business business) {

    if ( business.getPrincipalOwners().length > 0 ) {
      Arrays.stream(business.getPrincipalOwners()).forEach( this::validatePrincipalOwner );
    }

  }

  public void validatePrincipalOwner(User owner) {

    if ( SafetyUtil.isEmpty(owner.getJobTitle()) ) {
      throw new RuntimeException("Job title field must be populated.");
    }

    // birthday and age
    if ( owner.getBirthday() == null ) {
      throw new RuntimeException("Birthday required.");
    }

    if ( ! BusinessOnboardingValidator.validateAge(owner.getBirthday()) ) {
      throw new RuntimeException("Principal owner must be at least 16 years of age.");
    }

    // address
    if ( owner.getAddress() == null ) {
      throw new RuntimeException("Address is required.");
    }
    BusinessOnboardingValidator.validateAddress(owner.getAddress());

  }

  public void validateSigningOfficer(X x, Business business) {
    DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    DAO localUserDAO     = (DAO) x.get("localUserDAO");

    SinkHelper sink = new SinkHelper(x, localUserDAO);

    agentJunctionDAO.where(
      MLang.EQ(UserUserJunction.TARGET_ID, business.getId())
    ).select(sink);

    User signingOfficer = sink.getSigningOfficer();
    if ( signingOfficer == null ) {
      throw new RuntimeException("Signing officer is required.");
    }

    // job title
    if ( SafetyUtil.isEmpty(signingOfficer.getJobTitle()) ) {
      throw new RuntimeException("Job title required.");
    }

    // identification
    PersonalIdentification identification = signingOfficer.getIdentification();
    if ( identification == null ) {
      throw new RuntimeException("Identification required.");
    }
    BusinessOnboardingValidator.validateIdentification(identification);

    // additional documents
    if ( signingOfficer.getAdditionalDocuments().length <= 0 ) {
      throw new RuntimeException("Please upload at least one identification file for the signing officer.");
    }

    // birthday and age
    if ( signingOfficer.getBirthday() == null ) {
      throw new RuntimeException("Birthday required.");
    }

    if ( ! BusinessOnboardingValidator.validateAge(signingOfficer.getBirthday()) ) {
      throw new RuntimeException("Signing Officer must be at least 16 years of age.");
    }

  }

  public static boolean validateAge(Date date) {
    return new Date().getYear() - date.getYear() >= 16;
  }

  public static void validateAddress(Address address) {

    Pattern streetNumber = Pattern.compile("^[0-9 ]{1,16}$");
    if ( ! streetNumber.matcher(address.getStreetNumber()).matches() ) {
      throw new RuntimeException("Invalid street number.");
    }

    Pattern addressPattern = Pattern.compile("^[#a-zA-Z0-9 ]{1,70}$");
    if ( ! addressPattern.matcher(address.getStreetName()).matches() ) {
      throw new RuntimeException("Invalid street name.");
    }

    Pattern cityPattern = Pattern.compile("^[a-zA-Z ]{1,35}$");
    if ( ! cityPattern.matcher(address.getCity()).matches() ) {
      throw new RuntimeException("Invalid city name.");
    }

    if ( ! BusinessOnboardingValidator.validatePostalCode(
      address.getPostalCode(), address.getCountryId()
    )) {
      throw new RuntimeException("Invalid postal code.");
    }
  }

  public static boolean validatePostalCode(String code, String countryId) {

    Pattern caPosCode = Pattern.compile("^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ -]?\\d[ABCEGHJ-NPRSTV-Z]\\d$");
    Pattern usPosCode = Pattern.compile("^\\d{5}(?:[-\\s]\\d{4})?$");

    switch ( countryId ) {
      case "CA":
        return caPosCode.matcher(code).matches();
      case "US":
        return usPosCode.matcher(code).matches();
      default:
        return false;
    }
  }

  public static void validateIdentification(PersonalIdentification identification) {

    if ( SafetyUtil.isEmpty(identification.getIdentificationNumber()) ) {
      throw new RuntimeException("identification number required.");
    }

    if ( SafetyUtil.isEmpty(identification.getCountryId()) ) {
      throw new RuntimeException("Country of issue required.");
    }

    if ( SafetyUtil.isEmpty(identification.getRegionId()) ) {
      throw new RuntimeException("Province of issue required.");
    }

    if ( identification.getExpirationDate().before(new Date()) ) {
      throw new RuntimeException("Identification expiry date indicates that the ID is expired.");
    }

    if ( identification.getIssueDate() == null ) {
      throw new RuntimeException("Identification issue date required.");
    }

    if ( identification.getIdentificationTypeId() == 0 ) {
      throw new RuntimeException("Identification type required");
    }

  }

  public class SinkHelper extends AbstractSink {

    User signingOfficer = null;
    DAO localUserDAO = null;

    public SinkHelper(X x, DAO localUserDAO) {
      super(x);
      this.localUserDAO = localUserDAO.inX(x);
    }

    @Override
    public void put(Object obj, Detachable sub) {
      UserUserJunction junction = (UserUserJunction) obj;
      User user = (User) localUserDAO.find(junction.getSourceId());

      if ( user == null ) {
        return;
      }

      if ( user.getSigningOfficer() ) {
        signingOfficer = user;
      }
    }

    public User getSigningOfficer() {
      return this.signingOfficer;
    }
  }

}
