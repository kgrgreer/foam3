package net.nanopay.tx.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.Transfer;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;
import static net.nanopay.tx.model.TransactionStatus.COMPLETED;

public class TransactionTestUtil {

  public static User setupTestUser(X x, String email) {
    return TransactionTestUtil.setupTestUser(x, email, "CAD");
  }

  public static User setupTestUser(X x, String email, String currency) {
    return TransactionTestUtil.setupTestUser(x, email, currency, 10000L);
  }

  public static User setupTestUser(X x, String email, String currency, long initialAmount) {
    // Create the user
    User user = (User) ((DAO) x.get("localUserDAO")).find(EQ(User.EMAIL, email));
    if ( user == null || user.getDeleted() ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName(email.substring(0, email.indexOf("@")));
      user.setLastName("Tester");
      user.setEmailVerified(true);
      user.setGroup("admin");
      user = (User) (((DAO) x.get("localUserDAO")).put_(x, user)).fclone();
    }

    // Find or create the digital account
    DigitalAccount digitalAccount =
      (DigitalAccount) ((DAO) x.get("localAccountDAO")).find(
        AND(
          EQ(DigitalAccount.OWNER, user.getId()),
          EQ(DigitalAccount.DENOMINATION, currency),
          INSTANCE_OF(DigitalAccount.class)));
    if ( digitalAccount == null ) {
      digitalAccount = new DigitalAccount();
      digitalAccount.setName(currency + " Digital Account");
      digitalAccount.setOwner(user.getId());
      digitalAccount.setDenomination(currency);
      digitalAccount = (DigitalAccount) ((DAO) x.get("localAccountDAO")).put_(x, digitalAccount);
    }

    // Create the bank account
    BankAccount bankAccount =
      (BankAccount) ((DAO) x.get("localAccountDAO")).find(
        AND(
          EQ(BankAccount.OWNER, user.getId()),
          INSTANCE_OF(TransactionTestUtil.BankAccountClass(currency))) );
    if ( bankAccount == null ) {
      bankAccount = TransactionTestUtil.BankAccountFactory(currency);
      bankAccount.setName(currency + " Bank Account");
      bankAccount.setStatus(BankAccountStatus.VERIFIED);
      bankAccount.setAccountNumber("12345678");
      bankAccount.setOwner(user.getId());
      bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).put_(x, bankAccount);
    }

    // Add money from bank account to digital account if the balance is less than $10k
    if ((Long) digitalAccount.findBalance(x) < initialAmount) {
      Transaction transaction = new Transaction();
      transaction.setAmount(initialAmount);
      transaction.setSourceAccount(bankAccount.getId());
      transaction.setDestinationAccount(digitalAccount.getId());
      transaction = (Transaction) ((DAO) x.get("localTransactionDAO")).put_(x, transaction).fclone();
      transaction.setStatus(TransactionStatus.COMPLETED);
      transaction = (Transaction) ((DAO) x.get("localTransactionDAO")).put_(x, transaction);
    }

    // Return the newly setup user
    return user;
  }

  public static DigitalAccount RetrieveDigitalAccount(X x, User user) {
    return TransactionTestUtil.RetrieveDigitalAccount(x, user, "CAD");
  }

  public static DigitalAccount RetrieveDigitalAccount(X x, User user, String currency) {
    return
      (DigitalAccount) ((DAO) x.get("localAccountDAO")).find(
        AND(
          EQ(DigitalAccount.OWNER, user.getId()),
          EQ(DigitalAccount.DENOMINATION, currency),
          INSTANCE_OF(DigitalAccount.class)));
  }

  public static BankAccount RetrieveBankAccount(X x, User user) {
    return TransactionTestUtil.RetrieveBankAccount(x, user, "CAD");
  }

  public static BankAccount RetrieveBankAccount(X x, User user, String currency) {
    return
      (BankAccount) ((DAO) x.get("localAccountDAO")).find(
        AND(
          EQ(BankAccount.OWNER, user.getId()),
          INSTANCE_OF(TransactionTestUtil.BankAccountClass(currency))) );
  }

  private static BankAccount BankAccountFactory(String currency) {
    switch (currency) {
      case "CAD":
        return new CABankAccount();
      case "USD":
        return new USBankAccount();
      default:
        throw new RuntimeException("Unexpected currency: " + currency);
    }
  }

  private static Class BankAccountClass(String currency) {
    switch (currency) {
      case "CAD":
        return CABankAccount.class;
      case "USD":
        return USBankAccount.class;
      default:
        throw new RuntimeException("Unexpected currency: " + currency);
    }
  }
}
