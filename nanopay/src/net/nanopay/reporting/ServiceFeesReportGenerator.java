package net.nanopay.reporting;

import foam.core.X;

import javax.annotation.Nonnull;
import java.util.Calendar;

public class ServiceFeesReportGenerator extends ReportGenerator {
  @Override
  protected Object getSourceId(@Nonnull Object object) {
    return ((ReconciliationReport) object).getId();
  }

  @Override
  protected ServiceFeesReport generate(X x, @Nonnull Object src, Object[] args) {
    var rr = (ReconciliationReport) src;
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
}
