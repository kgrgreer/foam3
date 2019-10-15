package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.ascendantfx.AscendantFX;
import net.nanopay.fx.ascendantfx.AscendantFXServiceProvider;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.alterna.CsvUtil;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.model.Transaction;

/**
 * This DAO would accept FX Quote if it is not yet accepted and then submit deal to AscendantFX
 */
public class AFEXTransactionDAO
    extends ProxyDAO {

  public AFEXTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! (obj instanceof AFEXTransaction) ) {
      return getDelegate().put_(x, obj);
    }

    AFEXTransaction transaction = (AFEXTransaction) obj;
    AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");
    Logger logger = (Logger) x.get("logger");

    if (transaction.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED && transaction.getAfexTradeResponseNumber() == 0 ) {
      try {
        int result = afexService.createTrade(transaction);
        transaction.setAfexTradeResponseNumber(result);
      } catch (Throwable t) {
        logger.error(" Error creating trade for AfexTransaction " + transaction.getId(), t);
        throw new RuntimeException(t.getMessage());
      }
    }
    
    if ( transaction.getStatus() != TransactionStatus.PENDING || ! ( SafetyUtil.isEmpty( transaction.getReferenceNumber()) ) ) {
      return getDelegate().put_(x, obj);
    }

  ///Submit transation to AFEX
    try {
      Transaction txn = afexService.submitPayment(transaction);
      if ( ! SafetyUtil.isEmpty(txn.getReferenceNumber()) ) {
        transaction.setStatus(TransactionStatus.SENT);
        transaction.setReferenceNumber(txn.getReferenceNumber());
        FXQuote fxQuote = (FXQuote) ((DAO) x.get("fxQuoteDAO")).find(Long.parseLong(transaction.getFxQuoteId()));
        
        if ( null != fxQuote ) {
          Date date = null;
          try{
            DateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH);
            transaction.setCompletionDate(format.parse(fxQuote.getValueDate()));
          } catch ( Exception e) {
            ((Logger) x.get("logger")).error(" Error parsing FX quote value date ", e);
          }
          
        }
      } else {
        transaction.setStatus(TransactionStatus.DECLINED);
        logger.error("Error submitting payment to AFEX.");
        return getDelegate().put_(x, obj);
      }
    } catch (Throwable t) {
      transaction.setStatus(TransactionStatus.DECLINED);
      getDelegate().put_(x, transaction);
      ((Logger)x.get("logger")).error(" Error submitting payment for AfexTransaction " + transaction.getId(), t);
      throw new RuntimeException(t.getMessage());
    }
    
    return super.put_(x, transaction);
  }

}
