package net.nanopay.transactionservice;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.transactionservice.model.Transaction;
import net.nanopay.transactionservice.model.TransactionPurpose;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class SingleCurrencyTransactionService
  extends ContextAwareSupport
  implements TransactionService
{
  protected DAO transactionDAO_;
  protected DAO requestDAO_;
  protected DAO userDAO_;

  private String getISODate() {
    TimeZone timeZone     = TimeZone.getTimeZone("UTC");
    DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"); // Quoted "Z" to indicate UTC, no timezone offset
    dateFormat.setTimeZone(timeZone);
    return dateFormat.format(new Date());
  }

  public SingleCurrencyTransactionService(X x) {
    setX(x);
  }

  @Override
  public Transaction transferValueById(long payerId, long payeeId, long amount, String rate, String purposeCode, long fees, String notes)
    throws RuntimeException
  {
    if ( payerId <= 0 ) {
      throw new RuntimeException("Invalid Payer id");
    }

    if ( payeeId <= 0 ) {
      throw new RuntimeException("Invalid Payee id");
    }

    if ( amount < 0 ) {
      throw new RuntimeException("Invalid amount");
    }

    if ( rate == null || rate.isEmpty() ) {
      throw new RuntimeException("Invalid rate");
    }

    if ( purposeCode == null || purposeCode.isEmpty() ) {
      throw new RuntimeException("Invalid purpose");
    }

    if ( fees < 0 ) {
      throw new RuntimeException("Invalid fees");
    }

    Transaction transaction = new Transaction();
    transaction.setDate(new Date());
    transaction.setPayeeId(payeeId);
    transaction.setPayerId(payerId);
    transaction.setAmount(amount);
    transaction.setRate(Double.parseDouble(rate));
    transaction.setFees(fees);
    transaction.setNotes(notes);

    TransactionPurpose p = new TransactionPurpose();
    p.setCode(purposeCode);
    p.setProprietary(true);
    transaction.setPurpose(p);

    try {
      return (Transaction) transactionDAO_.put(transaction);
    } catch (RuntimeException e) {
      throw e;
    }
  }

  @Override
  public void transferValueByEmail(String payerEmail, String payeeEmail, Long amount)
    throws RuntimeException
  {
    Transaction transaction = new Transaction();
    userDAO_.where(MLang.EQ(User.EMAIL, payerEmail)).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        transaction.setPayerId(((User) obj).getId());
      }
    });

    userDAO_.where(MLang.EQ(User.EMAIL, payeeEmail)).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        transaction.setPayeeId(((User) obj).getId());
      }
    });
    transaction.setDate(new Date());
    transaction.setAmount(amount);

    try {
      transactionDAO_.put(transaction);
    } catch (RuntimeException e) {
      throw e;
    }
  }

  @Override
  public void requestValueById(Long payerId, Long payeeId, Long amount)
      throws RuntimeException
  {
    Transaction transaction = new Transaction();
    transaction.setDate(new Date());
    transaction.setPayeeId(payeeId);
    transaction.setPayerId(payerId);
    transaction.setAmount(amount);
    requestDAO_.put(transaction);
  }

  @Override
  public void requestValueByEmail(String payerEmail, String payeeEmail, Long amount)
    throws RuntimeException
  {
    Transaction transaction = new Transaction();
    userDAO_.where(MLang.EQ(User.EMAIL, payerEmail)).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        transaction.setPayerId(((User) obj).getId());
      }
    });

    userDAO_.where(MLang.EQ(User.EMAIL, payeeEmail)).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        transaction.setPayeeId(((User) obj).getId());
      }
    });

    transaction.setDate(new Date());
    transaction.setAmount(amount);
    requestDAO_.put(transaction);
  }

  @Override
  public void start() {
    transactionDAO_ = (DAO) getX().get("transactionDAO");
    userDAO_        = (DAO) getX().get("localUserDAO");
  }
}
