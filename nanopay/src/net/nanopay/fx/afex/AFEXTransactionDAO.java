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

    AFEXTransaction transaction = (AFEXTransaction) obj.fclone();
    if ( transaction.getStatus() == TransactionStatus.PENDING && SafetyUtil.isEmpty( transaction.getReferenceNumber())  ) {
      transaction.setStatus(TransactionStatus.SENT);
    }
    
    return super.put_(x, transaction);
  }

}
