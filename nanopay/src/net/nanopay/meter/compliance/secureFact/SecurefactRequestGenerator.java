package net.nanopay.meter.compliance.secureFact;

import foam.core.X;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.meter.compliance.secureFact.lev.model.LEVRequest;
import net.nanopay.meter.compliance.secureFact.sidni.model.*;
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
    request.setEntityName(business.getBusinessName());

    Address address = business.getAddress();
    if ( address == null ) {
      throw new IllegalStateException("Business address can't be null");
    }
    request.setCountry(address.getCountryId());
    request.setJurisdiction(address.getRegionId());
    request.setAddress(address.getPostalCode());

    BusinessType businessType = business.findBusinessTypeId(x);
    if ( businessType != null ) {
      String entityType = businessType.getName();
      if ( entityType.equals("Corporation")
        || entityType.equals("Sole Proprietorship")
        || entityType.equals("Partnership")
        || entityType.equals("Trade Name")
      ) {
        request.setEntityType(business.getType());
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
    if ( SafetyUtil.isEmpty(userAddress.getAddress()) ) {
      throw new IllegalStateException("User address can't be blank");
    }
    return new SIDniAddress[] {
      new SIDniAddress.Builder(x)
        .setAddressType("Current")
        .setAddressLine(userAddress.getAddress())
        .setCity(userAddress.getCity())
        .setProvince(userAddress.getRegionId())
        .setPostalCode(userAddress.getPostalCode())
        .build()
    };
  }

  private static SIDniPhone[] buildPhone(X x, User user) {
    List<SIDniPhone> list = new ArrayList<>();
    boolean hasMobile = false;

    Phone mobile = user.getMobile();
    if ( ! SafetyUtil.isEmpty(mobile.getNumber()) ) {
      list.add(
        new SIDniPhone.Builder(x)
          .setType("MOBILE")
          .setNumber(mobile.getNumber())
          .build()
      );
      hasMobile = true;
    }
    Phone phone = user.getPhone();
    if ( ! SafetyUtil.isEmpty(phone.getNumber()) ) {
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
