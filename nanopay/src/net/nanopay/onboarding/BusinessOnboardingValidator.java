package net.nanopay.onboarding;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.*;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.util.SafetyUtil;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.model.Business;
import net.nanopay.model.PersonalIdentification;
import net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static foam.mlang.MLang.IN;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class BusinessOnboardingValidator implements Validator {


  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
    Business business = (Business) obj;

    // This validator is used when the user completing the business profile.
    // This validation will only occurs when the compliance status set to requested.
    if ( business.getCompliance() == ComplianceStatus.REQUESTED ) {

      // 1. business profile
      validateBusinessProfile(business);

      // 2. transaction info
      validateTransactionInfo(business);

      // 3. signing officer
      validateSigningOfficers(x, business);

      // 4. Principal owners
      validatePrincipalOwners(business);

    }
  }

  public void validateBusinessProfile(Business business) {

    // organization name
    if ( SafetyUtil.isEmpty(business.getOrganization()) ) {
      throw new RuntimeException("Business name required.");
    }

    // phone number
    if ( business.getBusinessPhone() == null ) {
      throw new RuntimeException("Business phone required.");
    }

    // address
    Address businessAddress = business.getBusinessAddress();
    if ( businessAddress == null ) {
      throw new RuntimeException("Business Address required.");
    }
    BusinessOnboardingValidator.validateAddress(businessAddress);

    // type of business
    if ( business.getBusinessTypeId() <= 0 ) {
      throw new RuntimeException("Type of business is required.");
    }

    // business nature
    if ( business.getBusinessSectorId() <= 0 ) {
      throw new RuntimeException("Nature of business is required.");
    }

    // target customers
    if ( SafetyUtil.isEmpty(business.getTargetCustomers()) ) {
      throw new RuntimeException("Please specify who you market your product and services to.");
    }

    // source of funds
    if ( SafetyUtil.isEmpty(business.getSourceOfFunds()) ) {
      throw new RuntimeException("Source of funds is required.");
    }

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
        throw new RuntimeException("Annual Number of Transactions is required.");
      }

      if ( SafetyUtil.isEmpty(transactionInfo.getAnnualVolume()) ) {
        throw new RuntimeException("Estimated Annual Volume in USD is required.");
      }

      if ( transactionInfo.getFirstTradeDate() == null ) {
        throw new RuntimeException("Anticipated first payment date is required.");
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
      throw new RuntimeException("Job title required.");
    }

    // birthday and age
    if ( owner.getBirthday() == null ) {
      throw new RuntimeException("Date of birth required.");
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

  public void validateSigningOfficers(X x, Business business) {
    DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    DAO localUserDAO     = (DAO) x.get("localUserDAO");

    List<UserUserJunction> junctions = ((ArraySink) agentJunctionDAO
      .where(EQ(UserUserJunction.TARGET_ID, business.getId()))
      .select(new ArraySink())).getArray();
    List ids = junctions.stream().map(j -> j.getSourceId()).collect(Collectors.toList());
    Long[] idArray = (Long[]) (junctions.stream().map(j -> j.getSourceId()).collect(Collectors.toList())).toArray(new Long[ids.size()]);

    List signingOfficers = ((ArraySink) localUserDAO
      .where(AND(
        IN(User.ID, idArray),
        EQ(User.SIGNING_OFFICER, true)
      ))
      .select(new ArraySink())).getArray();

    if ( signingOfficers == null || signingOfficers.isEmpty() ) {
      throw new RuntimeException("Signing officer is required.");
    }

    signingOfficers.forEach(u -> validateSigningOfficer((User) u));

  }

  public void validateSigningOfficer(User signingOfficer) {

    // first name
    if ( SafetyUtil.isEmpty(signingOfficer.getFirstName()) ) {
      throw new RuntimeException("First name required.");
    }

    // last name
    if ( SafetyUtil.isEmpty(signingOfficer.getLastName()) ) {
      throw new RuntimeException("Last name required.");
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
      throw new RuntimeException("Date of birth required.");
    }

    if ( ! BusinessOnboardingValidator.validateAge(signingOfficer.getBirthday()) ) {
      throw new RuntimeException("Signing Officer must be at least 16 years of age.");
    }

  }

  public static boolean validateAge(Date date) {
    return new Date().getYear() - date.getYear() >= 16;
  }

  public static void validateAddress(Address address) {

    Pattern countryRegionId = Pattern.compile("^[A-Z ]{2}$");
    if ( ! countryRegionId.matcher(address.getCountryId()).matches() ) {
      throw new RuntimeException("Invalid country id.");
    }
    if ( ! countryRegionId.matcher(address.getRegionId()).matches() ) {
      throw new RuntimeException("Invalid region id.");
    }

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
      String codeType = address.getCountryId().equals("US") ?  "zip code" : "postal code";
      throw new RuntimeException("Invalid " + codeType + ".");
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
      throw new RuntimeException("Identification number required.");
    }

    if ( SafetyUtil.isEmpty(identification.getCountryId()) ) {
      throw new RuntimeException("Country of issue required.");
    }

    // check if passport is chosen as the identification
    if ( identification.getIdentificationTypeId() != 3 && SafetyUtil.isEmpty(identification.getRegionId()) ) {
      String regionType;
      switch ( identification.getCountryId() ) {
        case "CA":
          regionType = "Province";
          break;
        case "US":
          regionType = "State";
          break;
        default:
          regionType = "Region";
      }
      throw new RuntimeException(regionType + " of issue required.");
    }

    if ( identification.getExpirationDate().before(new Date()) ) {
      throw new RuntimeException("Identification expiry date indicates that the ID is expired.");
    }

    if ( identification.getIssueDate() == null ) {
      throw new RuntimeException("Identification issue date required.");
    }

    if ( identification.getIdentificationTypeId() == 0 ) {
      throw new RuntimeException("Identification type required.");
    }

  }

}
