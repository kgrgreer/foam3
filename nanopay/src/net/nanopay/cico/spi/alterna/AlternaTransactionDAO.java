package net.nanopay.cico.spi.alterna;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;

public class AlternaTransactionDAO
  extends ProxyDAO
{
  public AlternaTransactionDAO(X x) {
    this.setX(x);
    this.setOf(net.nanopay.tx.model.Transaction.getOwnClassInfo());
  }

  private static final Long ALTERNA_ID = 1L;

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    DAO transactionDAO = (DAO) getX().get("transactionDAO");
    Transaction transaction = (Transaction) obj;

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          transaction.setProviderId(ALTERNA_ID);
          Transaction completedTransaction = (Transaction) transactionDAO.put(transaction);
          super.put_(x, transaction);
          return completedTransaction;

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
