package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.cico.model.TransactionStatus;

public class CICOTransactionDAO
  extends ProxyDAO
{
  public CICOTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    DAO transactionDAO = (DAO) getX().get("transactionDAO");
    Transaction transaction = (Transaction) obj;

    if ( transaction.getAccountId() == null ) {
      throw new RuntimeException("Invalid bank account");
    }

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          if ( transaction.getCicoStatus() == null ) {
            transaction.setCicoStatus(TransactionStatus.NEW);
          }
          // Change later to check whether payeeId or payerId are ACTIVE brokers to set CASHIN OR CASHOUT...
          if ( transaction.getType() == null ) {
            transaction.setType(TransactionType.CASHOUT);
          }
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
