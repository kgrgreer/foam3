package net.nanopay.meter;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.session.Session;
import net.nanopay.model.Business;

public class IpHistoryService extends ContextAwareSupport {
  public IpHistoryService(X x) {
    setX(x);
  }

  public void record(Object target, String description) {
    X x = getX();
    Subject subject = (Subject) x.get("subject");
    User user = subject.getUser();
    Business business = null;
    Object agent = subject.getRealUser();

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

    Session session = x.get(Session.class);
    String ipAddress = session.getRemoteHost();
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
