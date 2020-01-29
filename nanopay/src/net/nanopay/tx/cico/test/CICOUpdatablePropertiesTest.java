package net.nanopay.tx.cico.test;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

import java.util.List;

public class CICOUpdatablePropertiesTest
  extends foam.nanos.test.Test
{
  User sender_;
  BankAccount bankAccount_;
  DigitalAccount senderDigital_;
  long CASH_OUT_AMOUNT = 1000L, CASH_IN_AMOUNT = 10000L;

  public void runTest(X x) {
    DAO dao = (DAO) x.get("localTransactionDAO");
    x_ = x;
    setupAccounts();
    bankAccount_ = (BankAccount) setupBankAccount(x, sender_);

    Transaction txn = new Transaction();
    txn.setAmount(CASH_IN_AMOUNT);
    txn.setSourceAccount(((Account) bankAccount_).getId());
    txn.setDestinationAccount(((Account) senderDigital_).getId());
    txn = (Transaction) (dao.put_(x, txn)).fclone();

    test(txn.getCompletionDate() == null, "completion date set.");
    txn.setStatus(TransactionStatus.SENT);
    txn = (Transaction) (dao.put_(x, txn)).fclone();

    java.util.Date date = new java.util.Date();
    txn.setCompletionDate(date);
    txn = (Transaction) (dao.put_(x, txn)).fclone();
    test(txn.getCompletionDate() != null, "completion date no set");
    test(txn.getCompletionDate().toString().equals(date.toString()), "completion date not as expected");

    txn.setStatus(TransactionStatus.COMPLETED);
    txn = (Transaction) (dao.put_(x, txn)).fclone();
    txn.setProcessDate(new java.util.Date());
    try {
      txn = (Transaction) (dao.put_(x, txn)).fclone();
      test(false, "did not generate RuntimeException trying to update on COMPLETE");
    } catch (RuntimeException e) {
      test(true, "caught expected RunttimeException trying to update on COMPLETED");
    }
 }

  public void setupAccounts() {
    sender_ = (User) ((DAO)x_.get("localUserDAO")).find(EQ(User.EMAIL,"cicotesting@nanopay.net" ));
    if ( sender_ == null ) {
      sender_ = new User();
      sender_.setFirstName("Francis");
      sender_.setLastName("Filth");
      sender_.setEmail("cicotesting@nanopay.net");
      sender_.setGroup("business");
    }
    sender_ = (User) sender_.fclone();
    sender_.setEmailVerified(true);
    sender_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, sender_)).fclone();
    senderDigital_ = DigitalAccount.findDefault(x_, sender_, "CAD");
  }

  public Account setupBankAccount(X x, User user) {
    bankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, user.getId()), INSTANCE_OF(CABankAccount.class)));
    if ( bankAccount_ == null ) {
      bankAccount_ = new CABankAccount();
      bankAccount_.setAccountNumber("21314124435345349999");
      bankAccount_.setOwner(user.getId());
    } else {
      bankAccount_ = (CABankAccount)bankAccount_.fclone();
    }
    bankAccount_.setStatus(BankAccountStatus.VERIFIED);
    bankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, bankAccount_).fclone();
    return bankAccount_;
  }
}
