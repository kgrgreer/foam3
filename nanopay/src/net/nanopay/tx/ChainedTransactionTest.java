package net.nanopay.tx;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.INBankAccount;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

public class ChainedTransactionTest
  extends foam.nanos.test.Test {

  CABankAccount sourceAccount;
  INBankAccount destinationAccount;
  User sender, receiver;
  DAO userDAO, accountDAO;
  Transaction txn;


  public void runTest(X x) {
    userDAO = (DAO) x.get("localUserDAO");
    accountDAO = (DAO) x.get("localAccountDAO");
    createAccounts(x);
    createTxn(x);


  }

  public void createTxn(X x) {
    txn = new Transaction();
    txn.setSourceAccount(sourceAccount.getId());
    txn.setDestinationAccount(destinationAccount.getId());
    txn.setAmount(100);
    txn = (Transaction) ((DAO) x.get("localTransactionDAO")).put_(x, txn);
  }

  public void createAccounts(X x) {

    //create users
    sender = (User) userDAO.find(EQ(User.EMAIL,"testuser1@nanopay.net" ));
    if ( sender == null ) {
      sender = new User();
      sender.setEmail("testUser1@nanopay.net");
      sender.setEmailVerified(true);
      sender = (User) userDAO.put_(x, sender);
    }

    receiver = (User) userDAO.find(EQ(User.EMAIL,"testuser2@nanopay.net" ));
    if ( receiver == null ) {
      receiver = new User();
      receiver.setEmail("testUser2@nanopay.net");
      receiver.setEmailVerified(true);
      receiver = (User) userDAO.put_(x, receiver);
    }


    //create bank accounts for users
    sourceAccount = (CABankAccount) accountDAO.find(AND(EQ(BankAccount.OWNER, sender.getId()), INSTANCE_OF(BankAccount.class)));
    if ( sourceAccount == null ) {
      sourceAccount = new CABankAccount();
      sourceAccount.setAccountNumber("213132443534534");
      sourceAccount.setOwner(sender.getId());
    } else {
      sourceAccount = (CABankAccount)sourceAccount.fclone();
    }
    sourceAccount.setStatus(BankAccountStatus.VERIFIED);
    sourceAccount = (CABankAccount) accountDAO.put_(x, sourceAccount).fclone();

    destinationAccount = (INBankAccount) accountDAO.find(AND(EQ(BankAccount.OWNER, receiver.getId()), INSTANCE_OF(BankAccount.class)));
    if ( destinationAccount == null ) {
      destinationAccount = new INBankAccount();
      destinationAccount.setAccountNumber("2131412443534534");
      destinationAccount.setOwner(receiver.getId());
    } else {
      destinationAccount = (INBankAccount)destinationAccount.fclone();
    }
    destinationAccount.setStatus(BankAccountStatus.VERIFIED);
    destinationAccount = (INBankAccount) accountDAO.put_(x, destinationAccount).fclone();

  }


}
