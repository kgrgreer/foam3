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

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.ProxySink;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import java.util.Calendar;

public class ServiceFeesReportDAO extends ProxyDAO {

  ServiceFeesReport adapt(ReconciliationReport rr) {
    if ( rr == null ) return null;
    var sfr = new ServiceFeesReport();

    sfr.setCreated(Calendar.getInstance().getTime());
    sfr.setLastModified(Calendar.getInstance().getTime());

    sfr.setPaymentId(rr.getPaymentId());
    sfr.setClientName(rr.getClientName());
    sfr.setMerchantId(rr.getMerchantId());
    sfr.setDebitCurrency(rr.getDebitCurrency());
    sfr.setDebitAmount(rr.getDebitAmount());
    sfr.setCreditCurrency(rr.getCreditCurrency());
    sfr.setCreditAmount(rr.getCreditAmount());
    sfr.setPaymentStartDate(rr.getPaymentStartDate());
    sfr.setPaymentReturnCode(rr.getPaymentReturnCode());
    sfr.setBillingId(rr.getBillingId());

    return sfr;
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
    return adapt((ReconciliationReport) getDelegate().find_(x, id));
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    // Sink used to filter the Reconciliation Reports, because 1:1 relationship, we can don't need
    // to filter the ServiceFeesReport, just the underlying ReconciliationReport
    var rrSink = new ProxySink(sink) {
      @Override
      public void put(Object obj, Detachable sub) {
        super.put(adapt((ReconciliationReport) obj), sub);
      }
    };

    getDelegate().select_(x, rrSink, skip, limit, order, predicate);
    return sink;
  }

  public ServiceFeesReportDAO(X x, DAO delegate) {
    super(x, delegate);
  }
}
