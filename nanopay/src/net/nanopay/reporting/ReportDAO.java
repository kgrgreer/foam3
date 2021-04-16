package net.nanopay.reporting;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.ProxySink;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.LastModifiedAware;

public class ReportDAO extends ProxyDAO {

  protected Predicate adaptPredicate(Predicate predicate) {
    if ( !( predicate instanceof FObject) )
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

  protected String generator;

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
    var g = (ReportGenerator) x.get(generator);
    return (FObject) g.generateReport(x, (LastModifiedAware) getDelegate().find_(x, id), new Object[0]);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    var generatorSink = new ProxySink(x, decorateSink(x, sink, skip, limit, order, null)) {
      @Override
      public void put(Object obj, Detachable sub) {
        var g = (ReportGenerator) x.get(generator);
        super.put(g.generateReport(x, (LastModifiedAware) obj, new Object[0]), sub);
      }
    };
    getDelegate().select(decorateSink(x, generatorSink, 0, MAX_SAFE_INTEGER, null, adaptPredicate(predicate)));
    return sink;
  }

  public ReportDAO(X x, DAO delegate, String generator) {
    super(x, delegate);
    this.generator = generator;
  }

}
