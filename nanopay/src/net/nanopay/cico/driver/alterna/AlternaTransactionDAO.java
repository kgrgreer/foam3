package net.nanopay.cico.driver.alterna;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.cico.driver.alterna.AlternaTransactionData;

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
  // private static final Long ALTERNA_ID = 1L;

  // @Override
  // public FObject put_(X x, FObject obj) throws RuntimeException {
  //   Txn txn = (Txn) obj;
  //   if ( txn instanceof AlternaTxn ) {
  //     ((AlternaTxn) txn).setProviderId(ALTERNA_ID);
  //   }
  //   return getDelegate().put_(x, txn);
  // }
}
