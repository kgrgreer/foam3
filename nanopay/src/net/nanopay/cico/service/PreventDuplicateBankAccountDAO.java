package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Count;
import net.nanopay.model.BankAccount;

/**
 * This DAO prevents the adding of duplicate bank accounts
 * based on the account owner, account number, transit number,
 * and instition number
 */
public class PreventDuplicateBankAccountDAO
    extends ProxyDAO
{
  public PreventDuplicateBankAccountDAO(DAO delegate) {
    this(null, delegate);
  }

  public PreventDuplicateBankAccountDAO(X x, DAO delegate) {
    super(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    BankAccount account = (BankAccount) obj;
    boolean newAccount = ( getDelegate().find(account.getId()) == null );

    // if new account, check to see if existing account exists
    // with same account information
    if ( newAccount ) {
      Count count = new Count();
      DAO bankAccountDAO = getDelegate();

      // prevent registration of account with same account name
      count = (Count) bankAccountDAO.where(AND(
          EQ(BankAccount.OWNER, account.getOwner()),
          EQ(BankAccount.ACCOUNT_NAME, account.getAccountName())
      )).limit(1).select(count);
      if ( count.getValue() == 1 ) {
        throw new RuntimeException("Bank account with same name already registered");
      }

      // prevent registration of account with same account details
      count = new Count();
      count = (Count) bankAccountDAO.where(AND(
          EQ(BankAccount.OWNER, account.getOwner()),
          EQ(BankAccount.ACCOUNT_NUMBER, account.getAccountNumber()),
          EQ(BankAccount.TRANSIT_NUMBER, account.getTransitNumber()),
          EQ(BankAccount.INSTITUTION_NUMBER, account.getInstitutionNumber())
      )).limit(1).select(count);
      if ( count.getValue() == 1 ) {
        throw new RuntimeException("Bank account with same details already registered");
      }
    }

    return super.put_(x, obj);
  }
}
