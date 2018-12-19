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

  public void record(String description) {
    X x = getX();
    HttpServletRequest request = x.get(HttpServletRequest.class);
    String ipAddress = request.getRemoteAddr();

    User user = (User) x.get("user");
    Business business = null;
    Object agent = x.get("agent");

    if (
      user instanceof Business
        && agent != null
    ) {
      business = (Business) user;
      user = (User) agent;
    }

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
