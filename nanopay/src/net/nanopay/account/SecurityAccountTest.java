package net.nanopay.account;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.util.SafetyUtil;


public class SecurityAccountTest
  extends foam.nanos.test.Test {

  X x_;

  @Override
  public void runTest(X x) {
    x_ = x;
    newSecurityAccount();
  }

  public void newSecurityAccount(){
    DAO accountDAO = (DAO) x_.get("localAccountDAO");
    SecuritiesAccount account = new SecuritiesAccount();
    account.setOwner(1002);
    Account acct = (Account) accountDAO.put(account);

    SecuritiesAccount acct2 = (SecuritiesAccount) acct;
    test(((Count)(acct2).getSubAccounts(x_).select(new Count())).getValue()  == 0, "Securities Account has no exisiting Security Accounts" );
    SecurityAccount sa = acct2.getSecurityAccount(x_,"NANO.TO");
    test(sa != null,"Security Account was indeed created, and is returned");
    test(! SafetyUtil.isEmpty(sa.getId()), "Security Account: " + sa.getId() + " has an ID");
    test(sa.getDenomination().equals("NANO.TO"), "Security Account has denomination: " + sa.getDenomination());

    test(((Count)(acct2).getSubAccounts(x_).select(new Count())).getValue()  == 1, "Securities Account has 1 Security Accounts" );
    SecurityAccount sa2 = acct2.getSecurityAccount(x_,"NANO.TO");
    test(((Count)((SecuritiesAccount)acct).getSubAccounts(x_).select(new Count())).getValue()  == 1, "Securities Account still has 1 Security Accounts" );
    test(SafetyUtil.equals(sa.getId(), sa2.getId()), "Same security account was accessed");

    //TODO: 1. make sure i cant open a security account in a denomination that dont exist.
    // 2. show that sending a transaction will open an account
  }

}
