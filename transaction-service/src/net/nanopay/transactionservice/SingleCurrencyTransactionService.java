package net.nanopay.transactionservice;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.*;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.transactionservice.model.Transaction;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

public class SingleCurrencyTransactionService
  extends ContextAwareSupport
  implements TransactionService
{
  protected DAO transactionDAO_;
  protected DAO requestDAO_;
  protected DAO userDAO_;

  private String getIDFromEmail(String email) {
    final String[] id = new String[1];
    userDAO_.where(MLang.EQ(User.EMAIL, email)).limit(1).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        id[0] = ((User) obj).getId();
      }
    });
    return id[0];
  }

  private String getISODate() {
    TimeZone timeZone     = TimeZone.getTimeZone("UTC");
    DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"); // Quoted "Z" to indicate UTC, no timezone offset
    dateFormat.setTimeZone(timeZone);
    return dateFormat.format(new Date());
  }

  @Override
  public void transferValueById(String payerId, String payeeId, Integer amount)
    throws RuntimeException
  {
    Transaction transaction = new Transaction();
    transaction.setDate(getISODate());
    transaction.setPayeeId(payeeId);
    transaction.setPayerId(payerId);
    transaction.setAmount(amount);
    transactionDAO_.put(transaction);
  }

  @Override
  public void transferValueByEmail(String payerEmail, String payeeEmail, Integer amount)
    throws RuntimeException
  {
    Transaction transaction = new Transaction();
    transaction.setPayeeId(getIDFromEmail(payeeEmail));
    transaction.setPayerId(getIDFromEmail(payerEmail));
    transaction.setDate(getISODate());
    transaction.setAmount(amount);
    transactionDAO_.put(transaction);
  }

  @Override
  public void requestValueById(String payerId, String payeeId, Integer amount)
      throws RuntimeException
  {
    Transaction transaction = new Transaction();
    transaction.setDate(getISODate());
    transaction.setPayeeId(payeeId);
    transaction.setPayerId(payerId);
    transaction.setAmount(amount);
    requestDAO_.put(transaction);
  }

  @Override
  public void requestValueByEmail(String payerEmail, String payeeEmail, Integer amount)
    throws RuntimeException
  {
    Transaction transaction = new Transaction();
    transaction.setPayerId(getIDFromEmail(payerEmail));
    transaction.setPayeeId(getIDFromEmail(payeeEmail));
    transaction.setDate(getISODate());
    transaction.setAmount(amount);
    requestDAO_.put(transaction);
  }

  @Override
  public void start() {
    transactionDAO_ = (DAO) getX().get("transactionDAO");
    requestDAO_ = (DAO) getX().get("requestDAO");
    userDAO_ = (DAO) getX().get("userDAO");
  }
}
