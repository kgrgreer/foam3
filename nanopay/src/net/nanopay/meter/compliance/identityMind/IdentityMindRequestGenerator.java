package net.nanopay.meter.compliance.identityMind;

import foam.core.X;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.auth.LoginAttempt;
import net.nanopay.model.Business;

import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class IdentityMindRequestGenerator {
  public static IdentityMindRequest getConsumerKYCRequest(X x, User user) {
    return new IdentityMindRequest.Builder(x)
      .setMan(String.valueOf(user.getId()))
      .setTea(user.getEmail())
      .setIp(getRemoteAddr(x))
      .setBfn(user.getFirstName())
      .setBln(user.getLastName())
      .setAccountCreationTime(formatDate(user.getCreated()))
      .build();
  }

  public static IdentityMindRequest getEntityLoginRequest(X x, LoginAttempt login) {
    User user = login.findLoginAttemptedFor(x);
    return new IdentityMindRequest.Builder(x)
      .setMan(String.valueOf(login.getLoginAttemptedFor()))
      .setTea(login.getEmail())
      .setIp(login.getIpAddress())
      .setBfn(user.getFirstName())
      .setBln(user.getLastName())
      .build();
  }

  public static IdentityMindRequest getMerchantKYCRequest(X x, Business business) {
    IdentityMindRequest request = new IdentityMindRequest.Builder(x)
      .setMan(String.valueOf(business.getId()))
      .setTea(business.getEmail())
      .setIp(getRemoteAddr(x))
      .build();

    String businessName = business.getBusinessName();
    request.setAmn(businessName);
    // NOTE: Use organization instead of businessName because
    // organization is registered business name.
    String organization = business.getOrganization();
    if ( ! SafetyUtil.isEmpty(organization)
      && ! organization.equals(organization)
    ) {
      request.setAmn(organization);
    }

    User user = getRealUser(x);
    if ( user != null ) {
      request.setAfn(user.getFirstName());
      request.setAln(user.getLastName());
    }

    Address address = business.getAddress();
    if ( address != null ) {
      request.setAsn(address.getStreetNumber() + " " + address.getStreetName() + " " + address.getSuite());
      request.setAc(address.getCity());
      request.setAco(address.getCountryId());
      request.setAs(address.getRegionId());
      request.setAz(address.getPostalCode());
    }

    Phone phone = business.getBusinessPhone();
    if ( phone != null
      && ! SafetyUtil.isEmpty(phone.getNumber())
    ) {
      request.setPhn(phone.getNumber());
    }

    if ( ! SafetyUtil.isEmpty(business.getWebsite()) ) {
      request.setWebsite(business.getWebsite());
    }
    return request;
  }

  private static User getRealUser(X x) {
    User agent = (User) x.get("agent");
    if ( agent != null ) {
      return agent;
    }
    return (User) x.get("user");
  }

  private static String formatDate(Date date) {
    if ( date != null ) {
      SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
      dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
      return dateFormat.format(date);
    }
    return null;
  }

  private static String getRemoteAddr(X x) {
    HttpServletRequest request = x.get(HttpServletRequest.class);
    if ( request != null ) {
      return request.getRemoteAddr();
    }
    return null;
  }
}
