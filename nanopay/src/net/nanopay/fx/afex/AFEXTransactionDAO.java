package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import foam.nanos.logger.Logger;
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
    if ( transaction.getStatus() != TransactionStatus.PENDING || getDelegate().find(transaction.getId()) != null) {
      return getDelegate().put_(x, obj);
    }

    AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("AFEXServiceProvider");

    if ( ! transaction.getAccepted() ) {
      try{
        if( afexService.acceptFXRate(transaction.getFxQuoteId(), transaction.getPayerId()) ) {
          transaction.setAccepted(true);
        }
      }catch(Throwable t) {
        ((Logger) x.get(Logger.class)).error("Error sending Accept Quote Request to AFEX.", t);
        return getDelegate().put_(x, obj);
      }
    }

    //Submit transation to AFEX
    try {
      Transaction txn = afexService.submitPayment(transaction);
      transaction.setStatus(TransactionStatus.SENT);
      transaction.setCompletionDate(generateCompletionDate());
      transaction.setReferenceNumber(txn.getReferenceNumber());
    } catch (Throwable t) {
      transaction.setStatus(TransactionStatus.DECLINED);
      getDelegate().put_(x, transaction);
      throw new RuntimeException(t.getMessage());
    }
    
    return super.put_(x, transaction);
  }

  private Date generateCompletionDate() {
    List<Integer> cadHolidays = CsvUtil.cadHolidays; // REVIEW: When BankHolidays is tested
    Calendar curDate = Calendar.getInstance();
    int businessDays = 2; // next 2 business days
    int i = 0;
    while ( i < businessDays ) {
      curDate.add(Calendar.DAY_OF_YEAR, 1);
      if ( curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
        && curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
        && ! cadHolidays.contains(curDate.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    return curDate.getTime();
  }

}
