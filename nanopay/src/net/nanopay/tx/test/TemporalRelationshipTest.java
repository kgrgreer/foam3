package net.nanopay.tx.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.exchangeable.Currency;

public class TemporalRelationshipTest extends foam.nanos.test.Test{

  public void runTest(X x) {
      Account account = (Account) ((DAO) x.get("localAccountDAO")).find(1L);
      test(account != null, "accont != null. account: " + account);
      test(account.findOwner(x) != null, "account.findOwner(x) != null. Found owner: : " + account.findOwner(x));
      test(account.getOwner() != 0, "account.getOwner() != 0. account.getOwner: " + account.getOwner());

      User user = ((User) ((DAO) x.get("localUserDAO")).find(account.getOwner()));

      test(user.getId() != 0, "iser.getId != 0. user.id: " + user.getId());
      test(user.findGroup(x) != null, "user.findGroup(x) != null. user.findGroup(x): " + user.findGroup(x));
      test(user.getGroup() != null, "user.getGroup) != null. user.getGroup: " + user.getGroup());

      Currency currency = (Currency) ((DAO) x.get("currencyDAO")).find("CAD");
      test(currency != null, "currency != null. currency:  " + currency);
      test(currency.findCountry(x) != null, "currency.findCountry(x) != null. currency.findCountry(x):  " + currency.findCountry(x));
      test(currency.getCountry() != null, "currency.getCountry() != null. currency.getCountry():  " + currency.getCountry());
  }
}
