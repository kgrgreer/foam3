package net.nanopay.account;

import foam.mlang.sink.Count;
import foam.nanos.auth.Group;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.bank.BankAccount;

/**
 * This DAO prevents Ablii users from adding multiple bank accounts,
 * which is a business requirement.
 */
public class LimitNumberOfBankAccountsDAO extends ProxyDAO {
  public LimitNumberOfBankAccountsDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    Group userGroup = (Group) x.get("group");
    Account newAccount = (Account) obj;

    Account existingAccount = (Account) getDelegate().inX(x).find(newAccount.getId());

    // If the account exists
    if ( existingAccount != null ) {
      return super.put_(x, obj);
    }

    if ( ! userGroup.isDescendantOf("sme", (DAO) x.get("groupDAO")) ) {
      return super.put_(x, obj);
    }

    // When the user adding a bank account for one of their contacts
    if ( user.getId() != newAccount.getOwner() ) {
      return super.put_(x, obj);
    }

    Count numberOfAccounts = (Count) getDelegate().inX(x).where(
      MLang.AND(
        MLang.INSTANCE_OF(BankAccount.class),
        MLang.EQ(Account.OWNER, user.getId()),
        MLang.EQ(Account.DELETED, false)
      )
    ).select(MLang.COUNT());

    if ( numberOfAccounts.getValue() == 0 ) {
      return super.put_(x, obj);
    } else {
      throw new RuntimeException("Only 1 bank account can be added.");
    }
  }

}
