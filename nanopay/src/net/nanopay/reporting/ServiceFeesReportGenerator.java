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

import foam.core.X;

import javax.annotation.Nonnull;
import java.util.Calendar;

public class ServiceFeesReportGenerator extends ReportGenerator {
  @Override
  protected Object getSourceId(@Nonnull Object object) {
    return ((ReconciliationReport) object).getId();
  }

  @Override
  protected ServiceFeesReport generate(X x, @Nonnull Object src) {
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
