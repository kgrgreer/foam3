package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Count;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import foam.nanos.auth.User;


/**
 * This DAO prevents users from setting default on non verified bank accounts
 * as well as setting old default account to false.
 */
public class PreventMultipleDefault
    extends ProxyDAO
{
  public PreventMultipleDefault(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof BankAccount ) ) {
      return getDelegate().put_(x, obj);
    }

    User user = (User) x.get("user");
    BankAccount account = (BankAccount) obj;
    BankAccount oldAcc = (BankAccount) getDelegate().find(account.getId());

    // Can't set non active accounts as default.
    if ( oldAcc != null & ! oldAcc.getIsDefault() && account.getIsDefault() ) {
      if ( ! account.getStatus().equals(BankAccountStatus.VERIFIED) ) {
        throw new RuntimeException("Unable to set non verified bank accounts as default.");
      }

      BankAccount oldDefault = (BankAccount) BankAccount.findDefault(x, account.findOwner(x), account.getDenomination());

      // Sets old default as non default bank account
      if ( oldDefault != null ) {
        oldDefault.fclone();
        oldDefault.setIsDefault(false);
        getDelegate().put(oldDefault);
      }
    }
    return super.put_(x, obj);
  }
}
