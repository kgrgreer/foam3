package net.nanopay.account;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.test.TestUtils;

import static foam.mlang.MLang.EQ;

public class DuplicateDigitalAccountRuleTest
  extends foam.nanos.test.Test {

  X x_;

  @Override
  public void runTest(X x) {
    x_ = x;
    DuplicateDigitalAccountRuleTest();
  }


  public void DuplicateDigitalAccountRuleTest(){

    User user = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, "tester@test.com"));
    if ( user == null ) {
      user = new User();
      user.setEmail("tester@test.com");
      user.setFirstName("DuplicateAccount");
      user.setLastName("Tester");
      user.setEmailVerified(true);
      user = (User) (((DAO) x_.get("localUserDAO")).put_(x_, user)).fclone();
    }
    DAO accountDAO = (DAO) x_.get("accountDAO");
    DigitalAccount dParent = new DigitalAccount.Builder(x_)
      .setName("parent")
      .setOwner(user.getId())
      .setDenomination("test")
      .build();
    dParent = (DigitalAccount) accountDAO.put(dParent).fclone();

    DigitalAccount dA = new DigitalAccount.Builder(x_)
      .setName("duplicateAccountChild")
      .setDenomination("test")
      .setEnabled(true)
      .setDesc("alsoTest")
      .setOwner(user.getId())
      .build();
    dA.setParent(dParent.getId());
    test(true, ""+dA.getId());

    DigitalAccount dB = new DigitalAccount.Builder(x_)
      .setName("duplicateAccountChild")
      .setDenomination("test")
      .setEnabled(true)
      .setDesc("alsoTest")
      .setOwner(user.getId())
      .build();
    dB.setParent(dParent.getId());
    accountDAO.put(dA);

    test(TestUtils.testThrows(
      () -> accountDAO.put(dB),
      "You cannot create this account because it is a duplicate of another",
      RuntimeException.class), "Exception: You cannot create this account because it is a duplicate of another");
  }
}
