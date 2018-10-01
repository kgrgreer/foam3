package net.nanopay.security.snapshooter;

import foam.nanos.logger.Logger;
import foam.dao.DAO;
import foam.dao.ArraySink;

public class Snap {

  protected DAO dao_;
  protected Logger logger_;

  public Snap(DAO dao, Logger logger) {
    dao_ = dao;
    logger_ = logger;
  }

  public ArraySink shoot() {
    logger_.debug("Dhiren debug: dao shooting...");
    //start snapping
    ArraySink sink = new ArraySink();
    return (ArraySink) dao_.select(sink);
  }
}
