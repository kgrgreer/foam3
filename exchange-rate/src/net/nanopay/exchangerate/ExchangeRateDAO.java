package net.nanopay.exchangerate;

import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractDAO;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import net.nanopay.exchangerate.model.Rate;


public class ExchangeRateDAO
  extends AbstractDAO
{

  @Override
  public FObject put_(X x, FObject fObject) throws RuntimeException {
    return fObject;
  }

  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long l, long l1, Comparator comparator, Predicate predicate) {
    return null;
  }

}
