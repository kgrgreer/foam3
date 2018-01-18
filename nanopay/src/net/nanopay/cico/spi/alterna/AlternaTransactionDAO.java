package net.nanopay.cico.spi.alterna;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;

public class AlternaTransactionDAO
  extends ProxyDAO
{
  public AlternaTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public AlternaTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  private static final Long ALTERNA_ID = 1L;

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;
    transaction.setProviderId(ALTERNA_ID);

    System.out.println("AlternaTransactionDAO calling delegate");
    return getDelegate().put_(x, transaction);
  }
}
