/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.meter.compliance.secureFact;

import foam.core.X;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.meter.compliance.secureFact.lev.*;
import net.nanopay.meter.compliance.secureFact.lev.document.*;
import net.nanopay.meter.compliance.secureFact.sidni.*;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessType;
import org.eclipse.jetty.util.StringUtil;

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

    request.setEntityName(StringUtil.isEmpty(business.getOrganization()) ? business.getBusinessName() : business.getOrganization());

    Address address = business.getAddress();
    if ( address == null
      || ! address.getCountryId().equals("CA")
    ) {
      throw new IllegalStateException("Business address must be in Canada.");
    }
    request.setCountry(address.getCountryId());
    request.setJurisdiction(address.getRegionId());
    request.setAddress(address.getPostalCode().replace(" ", ""));

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

  public static LEVDocumentOrderRequest getLEVDocumentOrderRequest(int resultId) {
    LEVDocumentOrderRequest request = new LEVDocumentOrderRequest();
    request.setResultId(resultId);

    return request;
  }

  public static LEVDocumentDataRequest getLEVDocumentDataRequest(int orderId) {
    LEVDocumentDataRequest request = new LEVDocumentDataRequest();
    request.setOrderId(orderId);

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
    if ( SafetyUtil.isEmpty(address) ) {
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
        .setPostalCode(userAddress.getPostalCode().replace(" ", ""))
        .build()
    };
  }

  private static SIDniPhone[] buildPhone(X x, User user) {
    List<SIDniPhone> list = new ArrayList<>();
    boolean hasMobile = false;

    String mobile = user.getMobileNumber();
    if ( ! SafetyUtil.isEmpty(mobile) ) {
      String mobileNumber = mobile.replaceAll("[-()]", "");
      list.add(
        new SIDniPhone.Builder(x)
          .setType("MOBILE")
          .setNumber(mobileNumber)
          .build()
      );
      hasMobile = true;
    }
    String phone = user.getPhoneNumber();
    if ( ! SafetyUtil.isEmpty(phone) ) {
      String phoneNumber = phone.replaceAll("[-()]", "");
      list.add(
        new SIDniPhone.Builder(x)
          .setType("HOME")
          .setNumber(phoneNumber)
          .build()
      );
      if ( ! hasMobile ) {
        list.add(
          new SIDniPhone.Builder(x)
            .setType("MOBILE")
            .setNumber(phoneNumber)
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
