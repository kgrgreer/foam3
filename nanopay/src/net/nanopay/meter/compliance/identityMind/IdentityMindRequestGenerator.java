package net.nanopay.meter.compliance.identityMind;

import foam.core.X;
import foam.nanos.auth.User;
import net.nanopay.auth.LoginAttempt;

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
