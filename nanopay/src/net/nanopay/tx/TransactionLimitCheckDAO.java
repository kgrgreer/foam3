package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.cico.model.TransactionStatus;

public class TransactionLimitCheckDAO
  extends ProxyDAO
{
  public TransactionLimitCheckDAO(DAO delegate) {
    setDelegate(delegate);
  }

  private static final String DEFAULT_USER_NAME = "default_user";

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO branchDAO = (DAO) x.get("branchDAO");
    DAO bankAccountDAO = (DAO) x.get("bankAccountDAO");
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    DAO transactionLimitDAO = (DAO) x.get("transactionLimitDAO");
    Transaction transaction = (Transaction) obj;

    if ( transaction.getBankAccountId() == null ) {
      throw new RuntimeException("Invalid bank account");
    }

    Long firstLock  = transaction.getPayerId() < transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = transaction.getPayerId() > transaction.getPayeeId() ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized ( firstLock ) {
      synchronized ( secondLock ) {
        try {

          // FOR WASEEM TO DO

          return getDelegate().put(transaction);

        } catch (RuntimeException e) {
          throw e;
        }
      }
    }
  }
}
