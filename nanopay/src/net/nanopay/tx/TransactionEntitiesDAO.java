package net.nanopay.tx;

import foam.dao.*;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionEntity;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;

public class TransactionEntitiesDAO extends ProxyDAO
{
  protected DAO accountDAO_;
  protected Logger logger_;
  protected DAO userDAO_;
  private class DecoratedSink extends foam.dao.ProxySink
  {
    public DecoratedSink(X x, Sink delegate)
    {
      super(x, delegate);
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub)
    {
      obj = fillEntitiesInfo((FObject) obj);
      getDelegate().put(obj, sub);
    }
  }

  public TransactionEntitiesDAO(X x, DAO delegate)
  {
    super(x, delegate);
    accountDAO_ = (DAO) x.get("localAccountDAO");
    logger_ = (Logger) x.get("logger");
    userDAO_ = (DAO) x.get("bareUserDAO");
  }

  @Override
  public FObject find_(X x, Object id)
  {
    FObject obj = getDelegate().find_(x, id);
    if( obj != null ) {
      obj = fillEntitiesInfo(obj);
    }
    return obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate)
  {
      Sink decoratedSink = new DecoratedSink(x, sink);
      getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
      return sink;
  }


  private FObject fillEntitiesInfo(FObject obj)
  {
    FObject clone = obj.fclone();
    Transaction tx = (Transaction) clone;
    Account sourceAccount = tx.findSourceAccount(x_);
    Account destinationAccount = tx.findDestinationAccount(x_);

    if ( sourceAccount != null ) {
      User payer = (User) userDAO_.find(sourceAccount.getOwner());

      if (payer == null) {
        logger_.error(String.format("Transaction: %d user for source account with Id: %d not found", tx.getId(),
            sourceAccount.getId()));
        tx.setPayer(null);
      }
      else {
        TransactionEntity payerEnitity = new TransactionEntity(payer);
        tx.setPayer(payerEnitity);
      }
    }

    if ( destinationAccount != null ) {
      User payee = (User) userDAO_.find(destinationAccount.getOwner());

      if (payee == null) {
        logger_.error(String.format("Transaction: %d user for destination account with Id: %d not found", tx.getId(),
            destinationAccount.getId()));
        tx.setPayee(null);
      }
      else {
        TransactionEntity payeeEnitity = new TransactionEntity(payee);
        tx.setPayee(payeeEnitity);
      }
    }

    return clone;
  }
}
