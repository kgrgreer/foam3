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

package net.nanopay.reporting;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;

import java.util.HashMap;
import java.util.Map;

public abstract class ReconciliationReportDAO extends ProxyDAO {

  protected Map<String, CITransaction> ciMap = new HashMap<>();
  protected Map<String, COTransaction> coMap = new HashMap<>();
  protected Map<String, DigitalTransaction> dtMap = new HashMap<>();
  protected Map<String, ReconciliationReport> rrCache = new HashMap<>();

  abstract protected String getGenerator();
  abstract protected void refreshMaps(X x);

  protected String getRoot(X x, Transaction transaction) {
    var superX = x.put("subject", new Subject.Builder(x).setUser(new User.Builder(x).setId(1).build()).build());

    while( transaction != null && ! (transaction instanceof SummaryTransaction) ) {
      transaction = transaction.findRoot(superX);
    }

    if ( transaction == null )
      throw new RuntimeException("CI/CO/Digital Transaction missing SummaryTransaction root");

    return transaction.getId();
  }

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
          } else if ( arg instanceof PropertyInfo ) {
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

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new UnsupportedOperationException("Can't call remove on ReconciliationReportDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    throw new UnsupportedOperationException("Can't call put on ReconciliationReportDAO");
  }

  @Override
  public FObject find_(X x, Object id) {
    var st = (SummaryTransaction) getDelegate().find_(x, id);
    if ( st == null ) {
      throw new RuntimeException("Couldn't find matching Summary Transaction for Reconciliation Report " + id.toString());
    }

    var rr = rrCache.get(st.getId());
    if ( rr != null && ! rr.getLastModified().before(st.getLastModified()) ) {
      return rr;
    }

    var cit = ciMap.get(st.getId());
    var cot = coMap.get(st.getId());
    var dt = dtMap.get(st.getId());

    if ( cit == null || cot == null || dt == null ) {
      refreshMaps(x);
      cit = ciMap.get(st.getId());
      cot = coMap.get(st.getId());
      dt = dtMap.get(st.getId());
    }

    var generator = (ReconciliationReportGenerator) x.get(getGenerator());

    var report = generator.generateReport(x, st, cit, cot, dt);
    rrCache.put(st.getId(), report);
    return report;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    refreshMaps(x);

    var nSink = new ReconciliationReportSink(x, getGenerator(), decorateSink(x, sink, skip, limit, order, null), ciMap, coMap, dtMap, rrCache);
    getDelegate().select(decorateSink(x, nSink, 0, MAX_SAFE_INTEGER, null, adaptPredicate(predicate)));
    return sink;
  }

  public ReconciliationReportDAO(X x, DAO delegate) {
    super(x, delegate);
  }
}
