package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.*;
import foam.mlang.sink.Count;
import net.nanopay.model.BankAccount;

public class PreventDuplicateBankAccountDAO
    extends ProxyDAO
{
  public PreventDuplicateBankAccountDAO(DAO delegate) {
    this(null, delegate);
  }

  public PreventDuplicateBankAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    BankAccount account = (BankAccount) obj;
    boolean newAccount = ( getDelegate().find(account.getId()) == null );

    if ( newAccount ) {
      Count count = new Count();
      DAO bankAccountDAO = (DAO) getX().get("bankAccountDAO");

      count = (Count) bankAccountDAO.where(AND(
          EQ(BankAccount.OWNER, account.getOwner()),
          EQ(BankAccount.ACCOUNT_NUMBER, account.getAccountNumber()),
          EQ(BankAccount.TRANSIT_NUMBER, account.getTransitNumber()),
          EQ(BankAccount.INSTITUTION_NUMBER, account.getInstitutionNumber())
      )).limit(1).select(count);

      if ( count.getValue() == 1 ) {
        throw new RuntimeException("Bank account already registered");
      }
    }

    return super.put_(x, obj);
  }
}