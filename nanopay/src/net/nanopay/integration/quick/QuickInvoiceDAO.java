package net.nanopay.integration.quick;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

public class QuickInvoiceDAO
  extends ProxyDAO {
  protected DAO userDAO_;

  public QuickInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("bareUserDAO");
  }
}
