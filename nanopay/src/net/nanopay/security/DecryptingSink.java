package net.nanopay.security;

import foam.core.X;
import foam.dao.AbstractDAO;
import foam.dao.Sink;
import foam.dao.ProxySink;
import foam.nanos.logger.Logger;

public class DecryptingSink
  extends ProxySink
{
  protected final foam.dao.AbstractDAO dao_;
  protected final foam.core.X x_;

  public DecryptingSink(X x, AbstractDAO dao, Sink delegate) {
    super(delegate);
    x_   = x;
    dao_ = dao;
  }

  public void put(Object obj, foam.core.Detachable sub) {
    try {
      EncryptedObject eo = (EncryptedObject) obj;
      super.put(dao_.find_(x_, eo.getId()), sub);
    } catch (Throwable t) {
      Logger logger = (Logger) getX().get("logger");
      logger.log(t);
    }
  }
}
