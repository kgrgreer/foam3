package net.nanopay.reporting;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;

import java.util.HashMap;
import java.util.Map;

public abstract class UserOnboardingReportDAO extends ProxyDAO {

  protected Map<Long, UserOnboardingReport> uorCache = new HashMap<>();

  protected Predicate adaptPredicate(Predicate predicate) {
    if ( !( predicate instanceof FObject ) )
      return predicate;

    FObject obj = (FObject) predicate;
    String[] propertiesToCheck = new String[] { "args", "arg1", "arg2" };
    for ( var propertyToCheck : propertiesToCheck ) {
      if ( obj.isPropertySet(propertyToCheck)) {
        Object arg = obj.getProperty(propertyToCheck);
        if ( arg != null ) {
          if ( arg instanceof Predicate ) {
            arg = adaptPredicate((Predicate) arg);
          } else if ( arg instanceof PropertyInfo) {
            PropertyInfo outerProperty = (PropertyInfo) arg;
            PropertyInfo innerProperty = (PropertyInfo) getDelegate().getOf().getAxiomByName(outerProperty.getName());
            arg = ( innerProperty != null ) ? innerProperty : outerProperty;
          } else if ( arg instanceof Predicate[] ) {
            Predicate[] array = (Predicate[]) arg;
            for ( int i = 0; i < array.length; i++ ) {
              array[i] = adaptPredicate(array[i]);
            }
          }
          obj.setProperty(propertyToCheck, arg);
        }
      }
    }

    return predicate;
  }

  abstract protected String getGenerator();

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new UnsupportedOperationException();
  }

  @Override
  public FObject put_(X x, FObject obj) {
    throw new UnsupportedOperationException();
  }

  @Override
  public FObject find_(X x, Object id) {
    var user = (User) getDelegate().find_(x, id);
    if ( user == null )
      return null;

    var uor = uorCache.get(user.getId());
    if ( uor != null && ! uor.getLastModified().before(user.getLastModified()) ) {
      return uor;
    }

    var generator = (UserOnboardingReportGenerator) x.get(getGenerator());
    var report = generator.generateReport(x, (User) getDelegate().find_(x, id));
    uorCache.put(user.getId(), report);
    return report;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    var nSink = new UserOnboardingReportSink(x, getGenerator(), decorateSink(x, sink, skip, limit, order, null), uorCache);
    getDelegate().select(decorateSink(x, nSink, 0, MAX_SAFE_INTEGER, null, adaptPredicate(predicate)));
    return sink;
  }

  public UserOnboardingReportDAO(X x, DAO delegate) {
    super(x, delegate);
  }
}
