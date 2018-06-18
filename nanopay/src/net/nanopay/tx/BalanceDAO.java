package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.model.Account;
import net.nanopay.model.MultiBalance;

/**
 * BalanceDAO is DAO to help transaction to support multi-currency. Every record include UserID, CurrencyCode,
 * Balance. UserID + CurrencyCode could use as combine primary to confirm the balance.
 */

public class BalanceDAO extends ProxyDAO {
  public BalanceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  public FObject find_(X x, Object userId) {
    String currentCurrency = x.get("currentCurrency") == null ? "CAD" : (String) x.get("currentCurrency");
    Account balance = new Account();
    balance.setId((long) userId);
    balance.setCurrencyCode(currentCurrency);

    return getDelegate().find_(x, balance);
  }
}
