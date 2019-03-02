package net.nanopay.meter;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.model.Business;

import javax.servlet.http.HttpServletRequest;

public class IpHistoryService extends ContextAwareSupport {
  public IpHistoryService(X x) {
    setX(x);
  }

  public void record(Object target, String description) {
    X x = getX();
    User user = (User) x.get("user");
    Business business = null;
    Object agent = x.get("agent");

    if (target instanceof Business) {
      business = (Business) target;
    }

    if (
      user instanceof Business
      && agent != null
    ) {
      business = (Business) user;
      user = (User) agent;
    }

    HttpServletRequest request = x.get(HttpServletRequest.class);
    String ipAddress = request.getRemoteAddr();
    IpHistory record = new IpHistory.Builder(x)
      .setUser(user.getId())
      .setIpAddress(ipAddress)
      .setDescription(description).build();

    if ( business != null ) {
      record.setBusiness(((Business) business).getId());
    }
    ((DAO) x.get("ipHistoryDAO")).put(record);
  }
}
