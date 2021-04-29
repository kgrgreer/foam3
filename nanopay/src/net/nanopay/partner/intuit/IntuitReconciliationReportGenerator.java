/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.CreatedAware;
import foam.nanos.auth.LastModifiedAware;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.partner.rbc.RBCReconciliationReportGenerator;
import net.nanopay.reporting.ReconciliationReport;
import net.nanopay.tx.FeeSummaryTransactionLineItem;
import net.nanopay.tx.FxSummaryTransactionLineItem;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.billing.Bill;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;

import static foam.mlang.MLang.EQ;
import static java.util.Calendar.*;

public class IntuitReconciliationReportGenerator extends RBCReconciliationReportGenerator {

  protected String intuitRevenueAccount;
  protected String nanopayRevenueAccount;

  public IntuitReconciliationReportGenerator(String spid, String intuitRevenueAccount, String nanopayRevenueAccount) {
    super(spid);
    this.intuitRevenueAccount = intuitRevenueAccount;
    this.nanopayRevenueAccount = nanopayRevenueAccount;
  }

  @Override
  protected ReconciliationReport generate(X x, @Nonnull FObject src, @Nullable FObject dst) {
    var transaction = (SummaryTransaction) src;
    var ciTransaction = ciMap.get(transaction.getId());
    var coTransaction = coMap.get(transaction.getId());
    var dt = dtMap.get(transaction.getId());

    // I think this could be done better
    if ( ciTransaction == null || coTransaction == null || dt == null ) {
      refreshMaps(x);
      ciTransaction = ciMap.get(transaction.getId());
      coTransaction = coMap.get(transaction.getId());
      dt = dtMap.get(transaction.getId());
    }

    if ( ciTransaction == null || coTransaction == null || dt == null ) {
      throw new RuntimeException("Missing required entries to generate Reconciliation Report from " + transaction.getId());
    }

    if ( ! (ciTransaction instanceof RbcCITransaction) || ! (coTransaction instanceof RbcCOTransaction) ) {
      throw new IllegalArgumentException("CI & CO Transactions must be RbcCI/RbcCO Transactions");
    }

    var rbcCiTransaction = (RbcCITransaction) ciTransaction;
    var rbcCoTransaction = (RbcCOTransaction) coTransaction;

    BmoFormatUtil.getCurrentDateTimeEDT();

    var report = dst == null ? new ReconciliationReport() : (ReconciliationReport) dst;
    var userDAO = (DAO) x.get("localUserDAO");
    var accountDAO = (DAO) x.get("localAccountDAO");
    var eftFileDAO = (DAO) x.get("eftFileDAO");
    var billDAO = (DAO) x.get("billDAO");
    var lineItems = transaction.getLineItems();

    var sink = (ArraySink) billDAO.where(EQ(Bill.ORIGINATING_SUMMARY_TRANSACTION, transaction.getId())).select(new ArraySink());
    if ( sink.getArray().size() == 1 ) {
      var bill = (Bill) sink.getArray().get(0);
      report.setBillingId(bill.getId());
    }

    report.setMerchantId(transaction.getExternalId());

    report.setPaymentId(transaction.getId());
    report.setPaymentCreatedDate(transaction.getCreated());
    report.setPaymentStartDate(rbcCiTransaction.getCreated());
    report.setPaymentStatusCategory(transaction.getChainSummary().getCategory());
    report.setPaymentStatus(transaction.getChainSummary().getStatus());
    report.setPaymentReturnCode(transaction.getChainSummary().getErrorCode());

    report.setSpid(transaction.getSpid());

    // TODO Need to check if source bank account country equals destination bank account country
    report.setTransactionType("Domestic");
    report.setPaymentMethod("EFT");

    report.setDebitAmount(rbcCiTransaction.getAmount());
    report.setDebitCurrency(rbcCiTransaction.getSourceCurrency());
    report.setDebitFileNumber(rbcCiTransaction.getRbcReferenceNumber());

    var debitEFT = (EFTFile) eftFileDAO.find(report.getDebitFileNumber());
    if ( debitEFT != null && ! debitEFT.getFileCreationTimeEDT().isEmpty() ) {
      report.setDebitFileDate(Date.from(BmoFormatUtil.parseDateTimeEDT(debitEFT.getFileCreationTimeEDT()).toInstant()));
    }

    report.setCreditAmount(rbcCoTransaction.getAmount());
    report.setCreditCurrency(rbcCoTransaction.getDestinationCurrency());
    report.setCreditFileNumber(rbcCoTransaction.getRbcReferenceNumber());

    var creditEFT = (EFTFile) eftFileDAO.find(report.getCreditFileNumber());
    if ( creditEFT != null && ! creditEFT.getFileCreationTimeEDT().isEmpty() ) {
      report.setCreditFileDate(Date.from(BmoFormatUtil.parseDateTimeEDT(creditEFT.getFileCreationTimeEDT()).toInstant()));
    }

    var srcAccount = (Account) accountDAO.find(rbcCiTransaction.getSourceAccount());
    if ( srcAccount != null ) {
      var srcUser = (User) userDAO.find(srcAccount.getOwner());
      report.setPayeeName(srcUser.getLegalName());
      report.setPayeeBusinessName(srcUser.getBusinessName());
    }

    var dstAccount = (Account) accountDAO.find(rbcCoTransaction.getDestinationAccount());
    if ( dstAccount != null ) {
      var dstUser = (User) userDAO.find(dstAccount.getOwner());
      report.setPayerName(dstUser.getLegalName());
      report.setPayerBusinessName(dstUser.getBusinessName());
      if ( report.getMerchantId().isEmpty() ) {
        report.setMerchantId(dstUser.getExternalId());
      }
    }

    report.setClientName(report.getPayerBusinessName().isEmpty() ? report.getPayerName() : report.getPayerBusinessName());
    report.setCreatorName(report.getClientName());

    var creator = (User) userDAO.find(transaction.getCreatedBy());
    if ( creator != null ) {
      report.setCreatorName(creator.getLegalName());
    }

    for ( var lineItem : lineItems ) {
      if ( lineItem instanceof FeeSummaryTransactionLineItem) {
        var fstLineItem = (FeeSummaryTransactionLineItem) lineItem;
        report.setFeeRevenueAmount(fstLineItem.getAmount());
        report.setFeeRevenueCurrency(fstLineItem.getCurrency());

        var feeLineItems = fstLineItem.getLineItems();
        for ( var feeLineItem : feeLineItems ) {
          if ( feeLineItem.getDestinationAccount().equals(intuitRevenueAccount) )
            report.setIntuitRevenue(feeLineItem.getAmount());
          else if ( feeLineItem.getDestinationAccount().equals(nanopayRevenueAccount) )
            report.setNanopayRevenue(feeLineItem.getAmount());
        }
      } else if ( lineItem instanceof FxSummaryTransactionLineItem) {
        var fxLineItem = (FxSummaryTransactionLineItem) lineItem;
        report.setClientFXRate(fxLineItem.getRate());
      }
    }

    if ( report.getClientFXRate().isEmpty() ) {
      report.setClientFXRate("1.0");
    }

    if ( rbcCoTransaction.getStatus() == TransactionStatus.COMPLETED ) {
      report.setCompletionDate(transaction.getCompletionDate());
    }

    if ( dt.getStatus() == TransactionStatus.COMPLETED ) {
      Calendar created = getInstance();
      if (dt.getCompletionDate() != null) {
        created.setTime(dt.getCompletionDate());
      } else {
        created.setTime(dt.getLastModified());
      }
      Calendar next = getInstance();
      next.clear();
      next.set(YEAR, created.get(YEAR));
      next.set(MONTH, created.get(MONTH) + 1);
      next.set(DAY_OF_MONTH, 1);

      // 10 business days from now
      int busDays = 10;
      while ( busDays != 0 ) {
        next.add(DAY_OF_MONTH, 1);
        if ( next.get(DAY_OF_WEEK) != SATURDAY && next.get(DAY_OF_WEEK) != SUNDAY )
          busDays--;
      }

      LocalDate nextMonth = next.getTime().toInstant()
        .atZone(ZoneId.systemDefault())
        .toLocalDate();
      report.setRevenuePaymentDate(Date.from(nextMonth.atStartOfDay(ZoneId.systemDefault()).toInstant()));
    }

    return (ReconciliationReport) super.generate(x, src, report);
  }

}
