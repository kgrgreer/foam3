package net.nanopay.dao;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import net.nanopay.tx.TransactionDAO;
import net.nanopay.tx.model.Transaction;

public class FilteredUserDAO
    extends ProxyDAO
{
  public FilteredUserDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    throw new UnsupportedOperationException("Unsupported Operation: put_");
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    if ( user != null && user.getId() == (long) id) {
      return super.find_(x, user.getId());
    }

    // only get user if logged in user has performed transactions with that user
    long userId = user.getId();
    DAO transactionDAO = (TransactionDAO) x.get("transactionDAO");
    Sink count = new Count();
    count = transactionDAO.where(MLang.OR(
        MLang.AND(MLang.EQ(Transaction.PAYEE_ID, userId), MLang.EQ(Transaction.PAYER_ID, id)),
        MLang.AND(MLang.EQ(Transaction.PAYER_ID, userId), MLang.EQ(Transaction.PAYEE_ID, id))
    )).select(count);

    if ( ((Count) count).getValue() <= 0 ) {
      throw new RuntimeException("Failed to find user with ID: " + (long) id);
    }

    User result = (User) super.find_(x, id);
    result.setSpid(null);
    result.setLastLogin(null);
    result.setPhone(null);
    result.setMobile(null);
    result.setBirthday(null);
    result.setAddress(null);
    result.setAccounts(null);
    result.setLanguage(null);
    result.setTimeZone(null);
    result.setPassword(null);
    result.setPreviousPassword(null);
    result.setPasswordLastModified(null);
    return result;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported Operation: select_");
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new UnsupportedOperationException("Unsupported Operation: remove_");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported Operation: removeAll_");
  }
}