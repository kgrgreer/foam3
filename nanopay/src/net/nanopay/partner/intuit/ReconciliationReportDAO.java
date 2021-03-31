package net.nanopay.partner.intuit;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.FeeSummaryTransactionLineItem;
import net.nanopay.tx.SummaryTransaction;
import net.nanopay.tx.billing.Bill;
import net.nanopay.tx.bmo.BmoFormatUtil;
import net.nanopay.tx.cico.EFTFile;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static foam.mlang.MLang.EQ;
import static java.util.Calendar.*;

public class ReconciliationReportDAO extends ProxyDAO {

  protected Map<String, RbcCITransaction> ciMap = new HashMap<>();
  protected Map<String, RbcCOTransaction> coMap = new HashMap<>();
  protected Map<String, DigitalTransaction> dtMap = new HashMap<>();
  protected Map<String, ReconciliationReport> rrCache = new HashMap<>();

  static ReconciliationReport generateReport(X x, SummaryTransaction transaction, RbcCITransaction ciTransaction, RbcCOTransaction coTransaction, DigitalTransaction dt) {
    if ( ciTransaction == null || coTransaction == null || dt == null ) {
      throw new RuntimeException("Missing required entries to generate Reconciliation Report from " + transaction.getId());
    }

    BmoFormatUtil.getCurrentDateTimeEDT();

    var report = new ReconciliationReport();
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

    report.setCreated(ciTransaction.getCreated());
    report.setLastModified(Calendar.getInstance().getTime());

    report.setMerchantId(transaction.getExternalId());

    report.setPaymentId(transaction.getId());
    report.setPaymentStartDate(ciTransaction.getCreated());
    report.setPaymentStatusCategory(transaction.getChainSummary().getCategory());
    report.setPaymentStatus(transaction.getChainSummary().getStatus());
    report.setPaymentReturnCode(transaction.getChainSummary().getErrorCode());

    report.setSpid(transaction.getSpid());

    // TODO Need to check if source bank account country equals destination bank account country
    report.setTransactionType("Domestic");
    report.setPaymentMethod("EFT");

    report.setDebitAmount(ciTransaction.getAmount());
    report.setDebitCurrency(ciTransaction.getSourceCurrency());
    report.setDebitFileNumber(ciTransaction.getRbcReferenceNumber());

    var debitEFT = (EFTFile) eftFileDAO.find(report.getDebitFileNumber());
    if ( debitEFT != null ) {
      report.setDebitFileDate(Date.from(BmoFormatUtil.parseDateTimeEDT(debitEFT.getFileCreationTimeEDT()).toInstant()));
    }

    report.setCreditAmount(coTransaction.getAmount());
    report.setCreditCurrency(coTransaction.getDestinationCurrency());
    report.setCreditFileNumber(coTransaction.getRbcReferenceNumber());

    var creditEFT = (EFTFile) eftFileDAO.find(report.getCreditFileNumber());
    if ( creditEFT != null ) {
      report.setCreditFileDate(Date.from(BmoFormatUtil.parseDateTimeEDT(creditEFT.getFileCreationTimeEDT()).toInstant()));
    }

    var srcAccount = (Account) accountDAO.find(ciTransaction.getSourceAccount());
    if ( srcAccount != null ) {
      var srcUser = (User) userDAO.find(srcAccount.getOwner());
      report.setPayeeName(srcUser.getLegalName());
      report.setPayeeBusinessName(srcUser.getBusinessName());
    }

    var dstAccount = (Account) accountDAO.find(coTransaction.getDestinationAccount());
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

    // Client FX rate

    for ( var lineItem : lineItems ) {
      if ( lineItem instanceof FeeSummaryTransactionLineItem) {
        var fstLineItem = (FeeSummaryTransactionLineItem) lineItem;
        report.setFeeRevenueAmount(fstLineItem.getAmount());
        report.setFeeRevenueCurrency(fstLineItem.getCurrency());

        var feeLineItems = fstLineItem.getLineItems();
        for ( var feeLineItem : feeLineItems ) {
          if ( feeLineItem.getDestinationAccount().equals("93f3fa36-7429-4b20-a223-f5b50a6d9872") )
            report.setIntuitRevenue(feeLineItem.getAmount());
          else if ( feeLineItem.getDestinationAccount().equals("ab590614-f5bd-476a-84e0-6037607397b5") )
            report.setNanopayRevenue(feeLineItem.getAmount());
        }
      }
    }

    if ( coTransaction.getStatus() == TransactionStatus.COMPLETED ) {
      report.setCompletionDate(transaction.getCompletionDate());
    }

    if ( dt.getStatus() == TransactionStatus.COMPLETED ) {
      Calendar created = getInstance();
      created.setTime(dt.getCompletionDate());
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

    return report;
  }

  String getRoot(X x, Transaction transaction) {
    var root = transaction.findRoot(x);
    while ( root != null && ! (root instanceof SummaryTransaction) )
      root = root.findRoot(x);

    if ( root == null )
      throw new RuntimeException("CI/CO/Digital Transaction missing SummaryTransaction root");

    return root.getId();
  }

  void refreshMaps(X x) {
    var transactionDAO = (DAO) x.get("localTransactionDAO");
    var transactions = (ArraySink) transactionDAO.select(new ArraySink());
    for ( var obj : transactions.getArray() ) {
      var transaction = (Transaction) obj;
      if ( transaction instanceof RbcCITransaction )
        ciMap.put(getRoot(x, transaction), (RbcCITransaction) transaction);
      else if ( transaction instanceof RbcCOTransaction )
        coMap.put(getRoot(x, transaction), (RbcCOTransaction) transaction);
      else if ( transaction instanceof DigitalTransaction)
        dtMap.put(getRoot(x, transaction), (DigitalTransaction) transaction);
    }
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
    var st = (SummaryTransaction) super.find_(x, id);
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

    var report = generateReport(x, st, cit, cot, dt);
    rrCache.put(st.getId(), report);
    return report;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    refreshMaps(x);

    var nSink = new ReconciliationReportSink(x, decorateSink(x, sink, skip, limit, order, predicate), ciMap, coMap, dtMap, rrCache);
    getDelegate().select(nSink);
    return sink;
  }

  public ReconciliationReportDAO(X x, DAO delegate) {
    super(x, delegate);
  }
}
