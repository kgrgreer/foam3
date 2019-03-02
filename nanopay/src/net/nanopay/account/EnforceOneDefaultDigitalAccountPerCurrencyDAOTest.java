package net.nanopay.account;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.core.FObject;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import java.util.List;
import static foam.mlang.MLang.*;
import net.nanopay.account.DigitalAccount;


public class EnforceOneDefaultDigitalAccountPerCurrencyDAOTest
    extends foam.nanos.test.Test {

  X x_;

  @Override
  public void runTest(X x) {
    x_ = x;
    testEnforceOneDefaultDigitalAccountPerCurrency();

  }


  public void testEnforceOneDefaultDigitalAccountPerCurrency(){
    DAO accountDAO = (DAO) x_.get("localAccountDAO");
    DigitalAccount account = new DigitalAccount();
    account.setDenomination("INR");
    account.setOwner(1002);
    account.setIsDefault(true);
    FObject acct =  accountDAO.put(account);

    DigitalAccount account2 = new DigitalAccount();
    account2.setDenomination("INR");
    account2.setOwner(1002);
    account2.setIsDefault(true);
    FObject acct2 =  accountDAO.put(account2);
    account2 = (DigitalAccount) acct.fclone();
    test(account2.getIsDefault(), "New Digital Account was set to default." );

    DigitalAccount clonedacct = (DigitalAccount) acct.fclone();
    DigitalAccount prevAcct = (DigitalAccount) accountDAO.find(clonedacct.getId());
    test( ! prevAcct.getIsDefault(), "Old Default account was changed from default." );


    DigitalAccount account3 = new DigitalAccount();
    account3.setDenomination("GBP");
    account3.setOwner(1002);
    account3 = (DigitalAccount) accountDAO.put(account3);
    test("GBP".equals(account3.getDenomination()), "We can add other currency Digital Account." );
    accountDAO.remove_(x_, clonedacct);
    accountDAO.remove_(x_, account3);
  }

}
