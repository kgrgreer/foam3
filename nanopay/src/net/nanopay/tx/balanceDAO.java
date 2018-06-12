package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.model.MultiBalance;

public class balanceDAO extends ProxyDAO {
  public balanceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public FObject find_(X x, Object userId) {
    String currentCurrency = x.get("currentCurrency") == null ? "CAD" : (String) x.get("currentCurrency");
    MultiBalance balance = new MultiBalance();
    balance.setUserId((long) userId);
    balance.setCurrencyCode(currentCurrency);

    return getDelegate().find_(x, balance);
  }
}
