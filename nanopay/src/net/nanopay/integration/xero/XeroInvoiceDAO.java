package net.nanopay.integration.xero;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

public class XeroInvoiceDAO
  extends ProxyDAO {
  protected DAO userDAO_;

  public XeroInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }
}
