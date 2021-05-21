package net.nanopay.tx.test;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.User;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.List;
import java.util.Random;

public class TransactionTestUtil {

  public static Random r = new Random();

  public static User setupTestUser(X x, String email) {
    return TransactionTestUtil.setupTestUser(x, email, "CAD");
  }

  public static User setupTestUser(X x, String email, String currency) {
    return TransactionTestUtil.setupTestUser(x, email, currency, 100000L);
  }

  public static String getRandomString() {
    String alphabet = "abcdefghijklmnopqrstuvwxyz";
    StringBuilder sb  = new StringBuilder();
    int l = r.nextInt(7) + 3;
    for ( int i = 0; i < l; i ++ ) {
      sb.append(alphabet.charAt(r.nextInt(26)));
    }
    return sb.toString();
  }

  public static String getRandomEmail() {
    return getRandomString() + "@" + getRandomString() + "." + getRandomString();
  }


  public static User createUser(X x) {
    String email = getRandomEmail();
    User user = new User();
    user.setEmail(email);
    user.setFirstName(email.substring(0, email.indexOf("@")));
    user.setLastName("Tester");
    user.setEmailVerified(true);
    user.setGroup("admin");
    user = (User) (((DAO) x.get("localUserDAO")).put_(x, user)).fclone();
    return user;
  }

  public static User setupTestUser(X x, String email, String currency, long initialAmount) {
    // Create the user
    User user = (User) ((DAO) x.get("localUserDAO")).find(EQ(User.EMAIL, email.toLowerCase()));
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
    List digitals =
      ((ArraySink) ((DAO) x.get("localAccountDAO")).where(
        AND(
          EQ(DigitalAccount.OWNER, user.getId()),
          EQ(DigitalAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE),
          EQ(DigitalAccount.DENOMINATION, currency),
          EQ(DigitalAccount.IS_DEFAULT, true),
          INSTANCE_OF(DigitalAccount.class))).select(new ArraySink())).getArray();

    // Create the bank account
    BankAccount bankAccount =
      (BankAccount) ((DAO) x.get("localAccountDAO")).find(
        AND(
          EQ(BankAccount.OWNER, user.getId()),
          EQ(BankAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE),
          INSTANCE_OF(TransactionTestUtil.BankAccountClass(currency))) );
    if ( bankAccount == null ) {
      bankAccount = TransactionTestUtil.BankAccountFactory(currency);
      bankAccount.setName(currency + " Bank Account");
      bankAccount.setStatus(BankAccountStatus.VERIFIED);
      bankAccount.setInstitution(10);
      bankAccount.setBranchId("12345");
      bankAccount.setAccountNumber("12345678");
      bankAccount.setOwner(user.getId());
      bankAccount.setLifecycleState(LifecycleState.ACTIVE);
      bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).put_(x, bankAccount);
    }

    // Add money from bank account to digital account if the balance is less than $10k
    for (Object o : digitals) {
      DigitalAccount digitalAccount = (DigitalAccount) o;
      if ((Long) digitalAccount.findBalance(x) < initialAmount) {
        Transaction transaction = new Transaction();
        transaction.setAmount(initialAmount);
        transaction.setSourceAccount(bankAccount.getId());
        transaction.setDestinationAccount(digitalAccount.getId());
        transaction = (Transaction) ((DAO) x.get("localTransactionDAO")).put_(x, transaction).fclone();

        // Only update the transaction if it isn't already complete
        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
          transaction.setStatus(TransactionStatus.COMPLETED);
          transaction = (Transaction) ((DAO) x.get("localTransactionDAO")).put_(x, transaction);
        }
      }
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
          EQ(DigitalAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE),
          INSTANCE_OF(DigitalAccount.class)));
  }

  public static DigitalAccount RetrieveDigitalAccount(X x, User user, String currency, DigitalAccount digitalAccount) {
    return
      (DigitalAccount) ((DAO) x.get("localAccountDAO")).find(
        AND(
          EQ(DigitalAccount.OWNER, user.getId()),
          EQ(DigitalAccount.DENOMINATION, currency),
          EQ(DigitalAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE),
          EQ(DigitalAccount.TRUST_ACCOUNT, digitalAccount.getTrustAccount()),
          INSTANCE_OF(DigitalAccount.class)));
  }
  public static DigitalAccount RetrieveDigitalAccount(X x, User user, String currency, String trust) {
    return
      (DigitalAccount) ((DAO) x.get("localAccountDAO")).find(
        AND(
          EQ(DigitalAccount.OWNER, user.getId()),
          EQ(DigitalAccount.DENOMINATION, currency),
          EQ(DigitalAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE),
          EQ(DigitalAccount.TRUST_ACCOUNT, trust),
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
