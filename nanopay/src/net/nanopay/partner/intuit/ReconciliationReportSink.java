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

package net.nanopay.partner.intuit;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;
import net.nanopay.reporting.ReconciliationReportGenerator;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;

import java.util.Map;

public class ReconciliationReportSink extends ProxySink {

  protected String generator;
  protected Map<String, CITransaction> ciMap;
  protected Map<String, COTransaction> coMap;
  protected Map<String, DigitalTransaction> dtMap;
  protected Map<String, ReconciliationReport> rrCache;

  @Override
  public void put(Object obj, Detachable sub) {
    var st = (SummaryTransaction) obj;

    var rr = rrCache.get(st.getId());
    if ( rr != null && rr.getLastModified() != null && ! rr.getLastModified().before(st.getLastModified()) ) {
      getDelegate().put(rr, sub);
    } else {
      var generator = (ReconciliationReportGenerator) getX().get(this.generator);
      var report = generator.generateReport(
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

  ReconciliationReportSink(X x, String generator, Sink delegate, Map<String, CITransaction> ciMap, Map<String, COTransaction> coMap, Map<String, DigitalTransaction> dtMap, Map<String, ReconciliationReport> rrCache) {
    setX(x);
    this.generator = generator;
    this.ciMap = ciMap;
    this.coMap = coMap;
    this.dtMap = dtMap;
    this.rrCache = rrCache;
    setDelegate(delegate);
  }

}
