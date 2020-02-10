package net.nanopay.tx.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.BankAccount;

public class TransactionSetupTest 
  extends foam.nanos.test.Test {

  public void runTest(X x){
    String[] currencies = new String[] { "CAD" }; // , "USD" }; // USD -> USD does not have a default planner

    for (String currency : currencies) {
      print("Testing utilities for currency: " + currency);

      User user = TransactionTestUtil.setupTestUser(x, "initial_user" + currency + "@subcubix.com", currency);
      test(user != null, "User " + user.label() + " returned.");
      test(user.getId() > 0, "User " + user.label() + " created.");
      test(user.getEmailVerified(), "User " + user.getEmail() + " email verified.");

      BankAccount bankAccount = TransactionTestUtil.RetrieveBankAccount(x, user, currency);
      test(bankAccount != null && bankAccount.getId() > 0, "Bank account found.");
      test(bankAccount != null && bankAccount.getStatus() == BankAccountStatus.VERIFIED, "Bank account verified");

      DigitalAccount digitalAccount = TransactionTestUtil.RetrieveDigitalAccount(x, user, currency);
      test(digitalAccount != null && digitalAccount.getId() > 0, "Digital account found.");
      test(digitalAccount != null && (Long) digitalAccount.findBalance(x) > 0L, "Digital account has a positive balance.");
    }
  }
}
