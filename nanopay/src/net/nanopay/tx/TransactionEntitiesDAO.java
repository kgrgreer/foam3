package net.nanopay.tx;

import foam.dao.*;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.nanos.logger.Logger;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionEntity;

public class TransactionEntitiesDAO extends ProxyDAO
{
  protected DAO accountDAO_;
  protected Logger logger_;
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
    // Only needed for table view on client, which will be seen here as an
    // ArraySink. Otherwise operations like COUNT() will also get decorated
    // then not short-circuited then become very slow.
    // TODO: remove this whole class or move to a tableViewTransactionDAO
    // which is only used by the tableView.
    if ( sink instanceof ArraySink ) {
      Sink decoratedSink = new DecoratedSink(x, sink);
      getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
      return sink;
    }

    return super.select_(x, sink, skip, limit, order, predicate);
  }


  private FObject fillEntitiesInfo(FObject obj)
  {
    FObject clone = obj.fclone();
    Transaction tx = (Transaction) clone;
    Account sourceAccount = tx.findSourceAccount(getX());
    Account destinationAccount = tx.findDestinationAccount(getX());

    if ( sourceAccount != null ) {
      User payer = sourceAccount.findOwner(getX());

      if (payer == null) {
        logger_.error(String.format("Transaction: %s - Source account %s owner %s not found.", tx.getId(),
                                    sourceAccount.getId(), sourceAccount.getOwner()));
        tx.setPayer(null);
      }
      else {
        TransactionEntity entity = new TransactionEntity(payer);
        String businessName = entity.getBusinessName();
        if ( SafetyUtil.isEmpty(businessName) ) {
          businessName = payer.getBusinessName();
        }
        if ( SafetyUtil.isEmpty(businessName) ) {
          businessName = payer.getOrganization();
        }
        entity.setBusinessName(businessName);
        tx.setPayer(entity);
      }
    }

    if ( destinationAccount != null ) {
      User payee = destinationAccount.findOwner(getX());

      if (payee == null) {
        logger_.error(String.format("Transaction: %s - Destination account %s owner %s not found.", tx.getId(),
                                    destinationAccount.getId(), destinationAccount.getOwner()));
        tx.setPayee(null);
      }
      else {
        TransactionEntity entity = new TransactionEntity(payee);
        String businessName = entity.getBusinessName();
        if ( SafetyUtil.isEmpty(businessName) ) {
          businessName = payee.getBusinessName();
        }
        if ( SafetyUtil.isEmpty(businessName) ) {
          businessName = payee.getOrganization();
        }
        entity.setBusinessName(businessName);
        tx.setPayee(entity);
      }
    }

    return clone;
  }
}
