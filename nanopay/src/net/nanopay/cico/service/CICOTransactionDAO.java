package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import java.util.Random;
import java.util.UUID;
import net.nanopay.tx.model.Transaction;

public class CICOTransactionDAO
  extends ProxyDAO
{
  public CICOTransactionDAO(X x) {
    this.setX(x);
    this.setOf(net.nanopay.tx.model.Transaction.getOwnClassInfo());
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    DAO transactionDAO = (DAO) getX().get("transactionDAO");
    Transaction transaction = (Transaction) obj;

    long payeeId = transaction.getPayeeId();
    long payerId  = transaction.getPayerId();

    if ( transaction.getPayerId() <= 0 ) {
      throw new RuntimeException("Invalid Payer id");
    }

    if ( transaction.getPayeeId() <= 0 ) {
      throw new RuntimeException("Invalid Payee id");
    }

    if ( transaction.getAmount() < 0 ) {
      throw new RuntimeException("Invalid amount");
    }

    if ( transaction.getRate() <= 0 ) {
      throw new RuntimeException("Invalid rate");
    }

    if ( transaction.getPurpose() == null ) {
      throw new RuntimeException("Invalid purpose");
    }

    if ( transaction.getFees() < 0 ) {
      throw new RuntimeException("Invalid fees");
    }

    Long firstLock  = payerId < payeeId ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = payerId > payeeId ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {
          Transaction completedTransaction = (Transaction) transactionDAO.put(transaction);
          // BUILD THE NEW MODEL
          // BUSINESS LOGIC
          // HERE IN THIS PART...
          super.put_(x, obj);
          return completedTransaction;

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
