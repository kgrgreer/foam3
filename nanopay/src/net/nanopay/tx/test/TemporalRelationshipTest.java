package net.nanopay.tx.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.model.Currency;

public class TemporalRelationshipTest {

  public void testRef(X x, long accountId, long userId) {
    System.out.println("TESTING RELATIONSHIP");
    Account account = (Account)((DAO) x.get("localAccountDAO")).find(accountId);
    System.out.println("account: " + account);
    System.out.println("account findOwner: " + account.findOwner(x));
    System.out.println("account getOwner: " + account.getOwner());
    User user = ((User)((DAO) x.get("localUserDAO")).find(account.getOwner()));
    System.out.println("x.getUserDAO.findAccount.getOwner.id: " + user.getId());
    System.out.println("user.findGroup: " + user.findGroup(x));
    System.out.println("user.getGroup: " + user.getGroup());

    System.out.println("TESTING REFERENCE");
    Currency currency = (Currency) ((DAO) x.get("currencyDAO")).find("CAD");
    System.out.println("currency: " + currency);
    System.out.println("currency.findCountry: " + currency.findCountry(x));
    System.out.println("currency.getCountry: " + currency.getCountry());


  }
}
