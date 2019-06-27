package net.nanopay.meter.compliance.secureFact;

import foam.core.X;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.meter.compliance.secureFact.lev.LEVRequest;
import net.nanopay.meter.compliance.secureFact.sidni.*;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessType;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

public class SecurefactRequestGenerator {
  public static SIDniRequest getSIDniRequest(X x, User user) {
    return new SIDniRequest.Builder(x)
      .setCustomer(buildCustomer(x, user))
      .setName(buildName(x, user))
      .setAddress(buildAddress(x, user))
      .setPhone(buildPhone(x, user))
      .setDateOfBirth(buildDateOfBirth(x, user))
      .build();
  }

  public static LEVRequest getLEVRequest(X x, Business business) {
    LEVRequest request = new LEVRequest();
    request.setSearchType("name");
    request.setEntityName(business.getOrganization());

    Address address = business.getBusinessAddress();
    if ( address == null
      || ! address.getCountryId().equals("CA")
    ) {
      throw new IllegalStateException("Business address must be in Canada.");
    }
    request.setCountry(address.getCountryId());
    request.setJurisdiction(address.getRegionId());
    request.setAddress(address.getPostalCode().replaceAll(" ", ""));

    BusinessType businessType = business.findBusinessTypeId(x);
    if ( businessType != null ) {
      String entityType = businessType.getName();
      if ( entityType.equals("Corporation")
        || entityType.equals("Sole Proprietorship")
        || entityType.equals("Partnership")
        || entityType.equals("Trade Name")
      ) {
        request.setEntityType(entityType);
      }
    }
    return request;
  }

  private static SIDniCustomer buildCustomer(X x, User user) {
    return new SIDniCustomer.Builder(x)
      .setUserReference(String.valueOf(user.getId()))
      // NOTE: Set consent granted to true because we already have the 
      //       user's consent for using Securefact to verify his/her identity
      //       when completing business profile in BeneficialOwnershipForm.
      .setConsentGranted(true)
      .setLanguage("en-CA")
      .build();
  }

  private static SIDniName buildName(X x, User user) {
    if ( SafetyUtil.isEmpty(user.getFirstName())
      || SafetyUtil.isEmpty(user.getLastName())
    ) {
      throw new IllegalStateException("User firstName or lastName can't be blank");
    }
    SIDniName name = new SIDniName.Builder(x)
      .setFirstName(user.getFirstName())
      .setLastName(user.getLastName())
      .build();
    if ( ! SafetyUtil.isEmpty(user.getMiddleName()) ) {
      name.setMiddleName(user.getMiddleName());
    }
    return name;
  }

  private static SIDniAddress[] buildAddress(X x, User user) {
    Address userAddress = user.getAddress();
    String address = userAddress.getAddress();
    if (userAddress == null
      || SafetyUtil.isEmpty(address)
    ) {
      throw new IllegalStateException("User address can't be blank");
    }
    if ( ! SafetyUtil.isEmpty(userAddress.getSuite()) ) {
      address = userAddress.getSuite() + " - " + userAddress.getAddress();
    }
    return new SIDniAddress[] {
      new SIDniAddress.Builder(x)
        .setAddressType("Current")
        .setAddressLine(address)
        .setCity(userAddress.getCity())
        .setProvince(userAddress.getRegionId())
        .setPostalCode(userAddress.getPostalCode().replaceAll(" ", ""))
        .build()
    };
  }

  private static SIDniPhone[] buildPhone(X x, User user) {
    List<SIDniPhone> list = new ArrayList<>();
    boolean hasMobile = false;

    Phone mobile = user.getMobile();
    if ( mobile != null && ! SafetyUtil.isEmpty(mobile.getNumber()) ) {
      list.add(
        new SIDniPhone.Builder(x)
          .setType("MOBILE")
          .setNumber(mobile.getNumber())
          .build()
      );
      hasMobile = true;
    }
    Phone phone = user.getPhone();
    if ( phone != null && ! SafetyUtil.isEmpty(phone.getNumber()) ) {
      list.add(
        new SIDniPhone.Builder(x)
          .setType("HOME")
          .setNumber(phone.getNumber())
          .build()
      );
      if ( ! hasMobile ) {
        list.add(
          new SIDniPhone.Builder(x)
            .setType("MOBILE")
            .setNumber(phone.getNumber())
            .build()
        );
      }
    }
    return list.toArray(new SIDniPhone[0]);
  }

  private static String buildDateOfBirth(X x, User user) {
    if ( user.getBirthday() == null ) {
      throw new IllegalStateException("User birthday can't be null");
    }
    SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
    return dateFormat.format(user.getBirthday());
  }
}
