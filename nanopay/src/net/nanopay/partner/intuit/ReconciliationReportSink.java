package net.nanopay.partner.intuit;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;

import java.util.Map;

public class ReconciliationReportSink extends ProxySink {

  protected Map<String, RbcCITransaction> ciMap;
  protected Map<String, RbcCOTransaction> coMap;
  protected Map<String, DigitalTransaction> dtMap;
  protected Map<String, ReconciliationReport> rrCache;

  @Override
  public void put(Object obj, Detachable sub) {
    var st = (SummaryTransaction) obj;

    var rr = rrCache.get(st.getId());
    if ( rr != null && rr.getLastModified() != null && ! rr.getLastModified().before(st.getLastModified()) ) {
      getDelegate().put(rr, sub);
    } else {
      var report = ReconciliationReportDAO.generateReport(
        getX(),
        st,
        ciMap.get(st.getId()),
        coMap.get(st.getId()),
        dtMap.get(st.getId())
      );

      rrCache.put(st.getId(), report);
      getDelegate().put(report, sub);
    }
  }

  ReconciliationReportSink(X x, Sink delegate, Map<String, RbcCITransaction> ciMap, Map<String, RbcCOTransaction> coMap, Map<String, DigitalTransaction> dtMap, Map<String, ReconciliationReport> rrCache) {
    setX(x);
    this.ciMap = ciMap;
    this.coMap = coMap;
    this.dtMap = dtMap;
    this.rrCache = rrCache;
    setDelegate(delegate);
  }

}
