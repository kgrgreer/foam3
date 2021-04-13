package net.nanopay.reporting;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;
import foam.nanos.auth.User;

import java.util.Map;

public class UserOnboardingReportSink extends ProxySink {

  protected String generator;
  protected Map<Long, UserOnboardingReport> uorCache;

  @Override
  public void put(Object obj, Detachable sub) {
    var user = (User) obj;

    var uor = uorCache.get(user.getId());
    if ( uor != null && uor.getLastModified() != null && ! uor.getLastModified().before(uor.getLastModified()) ) {
      getDelegate().put(uor, sub);
    } else {
      var generator = (UserOnboardingReportGenerator) getX().get(this.generator);
      var report = generator.generateReport(getX(), user);

      uorCache.put(user.getId(), report);
      getDelegate().put(report, sub);
    }
  }

  UserOnboardingReportSink(X x, String generator, Sink delegate, Map<Long, UserOnboardingReport> uorCache) {
    setX(x);
    this.generator = generator;
    this.uorCache = uorCache;
    setDelegate(delegate);
  }
}
