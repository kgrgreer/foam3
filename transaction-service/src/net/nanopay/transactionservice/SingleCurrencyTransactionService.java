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

  private String getISODate() {
    TimeZone timeZone     = TimeZone.getTimeZone("UTC");
    DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'"); // Quoted "Z" to indicate UTC, no timezone offset
    dateFormat.setTimeZone(timeZone);
    return dateFormat.format(new Date());
  }

  @Override
  public void transferValueById(Long payerId, Long payeeId, Long amount)
    throws RuntimeException
  {
    Transaction transaction = new Transaction();
    transaction.setDate(new Date());
    transaction.setPayeeId(payeeId);
    transaction.setPayerId(payerId);
    transaction.setAmount(amount);
    transactionDAO_.put(transaction);
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
    transactionDAO_.put(transaction);
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
  public DAO getTransactionsById(Long userId)
    throws RuntimeException
  {
    return transactionDAO_.where(MLang.OR(MLang.EQ(Transaction.PAYER_ID, userId), MLang.EQ(Transaction.PAYEE_ID, userId)));
  }

  @Override
  public DAO getTransactionsByEmail(String userEmail)
    throws RuntimeException
  {
    ListSink users  = (ListSink) userDAO_.where(MLang.EQ(User.EMAIL, userEmail)).select(new ListSink());
    List userList   = users.getData();

    if ( userList.size() > 0 ) {
      User user = (User) userList.get(0);
      return transactionDAO_.where(MLang.OR(MLang.EQ(Transaction.PAYER_ID, user.getId()), MLang.EQ(Transaction.PAYEE_ID, user.getId())));
    } else {
      return null;
    }
  }

  @Override
  public void start() {
    TransactionDAO transactionDAO = new TransactionDAO();
    transactionDAO.setOf(Transaction.getOwnClassInfo());
    transactionDAO.setX(this.getX());

    MapDAO requestDAO = new MapDAO();
    requestDAO.setOf(Transaction.getOwnClassInfo());
    requestDAO.setX(this.getX());

    try {
      transactionDAO_ = new JDAO(transactionDAO, "transactions");
      requestDAO_     = new JDAO(requestDAO, "requests");
    } catch (IOException e) {
      e.printStackTrace();
    }

    this.getX().put("transactionDAO", transactionDAO_);
    this.getX().put("requestDAO", requestDAO_);

    userDAO_ = (DAO) getX().get("userDAO");
  }
}
