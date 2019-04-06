package net.nanopay.tx;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.INBankAccount;
import net.nanopay.fx.ExchangeRatesCron;
import net.nanopay.fx.ascendantfx.AscendantFXUser;
import net.nanopay.fx.FXTransaction;
import net.nanopay.fx.FXUserStatus;
import net.nanopay.tx.alterna.AlternaCITransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

public class ChainedTransactionTest
  extends foam.nanos.test.Test {

  CABankAccount sourceAccount;
  INBankAccount destinationAccount;
  User sender, receiver;
  DAO userDAO, accountDAO, txnDAO;
  Transaction txn;


  public void runTest(X x) {
    userDAO = (DAO) x.get("localUserDAO");
    accountDAO = (DAO) x.get("localAccountDAO");
    txnDAO = ((DAO) x.get("localTransactionDAO"));
    ExchangeRatesCron cron = new ExchangeRatesCron();
    cron.execute(x);
    createAccounts(x);
    setupAscendantUser(x);
    populateBrokerAccount(x);
    testCADBankINBankTxn(x);
  }
  public void testCADBankINBankTxn(X x) {
    createTxn(x);
    ArraySink sink;
    //test top level
    test( "".equals(txn.getParent()), "top level transaction has no parent");
    test(txn.getClass() == SummaryTransaction.class, "top level transaction is SummaryTransaction.class");
    test(txn.getStatus() == TransactionStatus.COMPLETED, "top level txn has status COMPLETED");
    test(txn.getState(x)== TransactionStatus.PENDING, "top level txn has state PENDING");

    //test CADBank -> CADDigital
    AlternaCITransaction tx2;
    sink = (ArraySink) txnDAO.where(EQ(Transaction.PARENT, txn.getId())).select(new ArraySink());
    test(sink.getArray().size() == 1, "tx2: top level is parent to a single transaction");
    tx2 = (AlternaCITransaction) sink.getArray().get(0);
    test(tx2 instanceof AlternaCITransaction, "tx2: instanceof AlternaCITransaction");
    test(tx2.getStatus() == TransactionStatus.PENDING, "tx2: has status PENDING");
    test(SafetyUtil.equals(tx2.getSourceCurrency(), tx2.getDestinationCurrency()), "tx2: sourceCurrency == detstinationCurrency");
    test(SafetyUtil.equals(tx2.getDestinationCurrency(), "CAD"), "tx2: destinationCurrency == CAD");

    //test CADDigital -> INRDigital
    FXTransaction tx3;
    sink = (ArraySink) txnDAO.where(EQ(Transaction.PARENT, tx2.getId())).select(new ArraySink());
    test(sink.getArray().size() == 1, "tx3: tx2 is parent to a single transaction");
    tx3 = (FXTransaction) sink.getArray().get(0);
    test(tx3.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "tx3: status PENDING_PARENT_COMPLETED");
    test(tx3.getSourceCurrency() != tx3.getDestinationCurrency(), "tx3: sourceCurrency != detstinationCurrency");
    test(SafetyUtil.equals(tx3.getDestinationCurrency(),"INR"), "tx3: destinationCurrency == INR");
    test(SafetyUtil.equals(tx3.getSourceCurrency(),"CAD"), "tx3: sourceCurrency == CAD");
    test(tx3.getFxRate() != 0.0, "tx3: fx rate retrieved");
    test(tx3.getDestinationAmount() != 0, "tx3: destinationAmount is set");

    KotakCOTransaction tx4;
    sink = (ArraySink) txnDAO.where(EQ(Transaction.PARENT, tx3.getId())).select(new ArraySink());
    test(sink.getArray().size() == 1, "tx4: tx3 is parent to a single transaction");
    tx4 = (KotakCOTransaction)  sink.getArray().get(0);
    test(tx4.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "tx4: status Pending");
    test(tx4.getSourceCurrency() == tx4.getDestinationCurrency(), "tx4: sourceCurrency == destinationCurrency");
    test(tx4.getDestinationCurrency() == "INR", "tx4: destinationCurrency == INR");

    test( tx4.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "Last transaction: getStatus == PENDING_PARENT_COMPLETED");

    //Complete tx2
    Transaction t = (Transaction) txnDAO.find_(x, tx2.getId()).fclone();
    test(t.getStatus() == TransactionStatus.PENDING, "AlternaCI tx2 has status PENDING");
    t.setStatus(TransactionStatus.COMPLETED);
    t = (Transaction) txnDAO.put_(x, t).fclone();
    test(t.getStatus() == TransactionStatus.COMPLETED, "AlternaCI tx2 has status COMPLETED");

    tx3 = (FXTransaction) txnDAO.find(tx3.getId());
    test(tx3.getStatus() == TransactionStatus.COMPLETED, "CAT tx3 was updated automamtically");

    tx4 = (KotakCOTransaction) txnDAO.find(tx4.getId());
    test(tx4.getStatus() == TransactionStatus.PENDING, "Kotak tx4 transaction has status == PENDING");
    test(txn.getState(x) == TransactionStatus.PENDING, "top level tx in PENDING state");

    //complete last kotak txn;
    tx4.setStatus(TransactionStatus.SENT);
    tx4 = (KotakCOTransaction) txnDAO.put_(x, tx4);
    test(tx4.getStatus() == TransactionStatus.SENT, "tx4 status SENT");
    tx4.setStatus(TransactionStatus.COMPLETED);
    tx4 = (KotakCOTransaction) txnDAO.put_(x, tx4);
    test(tx4.getStatus() == TransactionStatus.COMPLETED, "tx4 status COMPLETED");

    txn = (Transaction) txnDAO.find(txn.getId());
    test(txn.getStatus() == TransactionStatus.COMPLETED, "top level txn status COMPLETED");
    test(txn.getState(x) == TransactionStatus.COMPLETED, "top level txn state COMPLETED");
  }
  public void populateBrokerAccount(X x) {
    User brokerUser = (User) ((DAO) x.get("localUserDAO")).find(1002L);
    brokerUser.setEmailVerified(true);
    brokerUser.setFirstName("Monopoly");
    brokerUser.setLastName("Guy");
    brokerUser = (User) (((DAO) x.get("localUserDAO")).put_(x, brokerUser)).fclone();

    CABankAccount brokerbank = (CABankAccount) accountDAO.find(AND(EQ(BankAccount.OWNER, 1002L), INSTANCE_OF(BankAccount.class)));
    if ( brokerbank == null ) {
      brokerbank = new CABankAccount();
      brokerbank.setAccountNumber("213343534534");
      brokerbank.setOwner(1002L);
    } else {
      brokerbank = (CABankAccount)brokerbank.fclone();
    }
    brokerbank.setStatus(BankAccountStatus.VERIFIED);
    brokerbank.setDenomination("INR");
    brokerbank = (CABankAccount) accountDAO.put_(x, brokerbank).fclone();

    // CI to load digital broker
    Transaction tx = new Transaction();
    tx.setSourceAccount(brokerbank.getId());
    tx.setSourceCurrency("INR");
    tx.setDestinationCurrency("INR");
    tx.setPayeeId(1002L);
    tx.setAmount(10000000);
    tx = (Transaction) ((Transaction) txnDAO.put_(x, tx)).fclone();
    tx.setStatus(TransactionStatus.COMPLETED);
    tx = (Transaction) txnDAO.put_(x, tx);
  }

  public void createTxn(X x) {
    txn = new Transaction();
    txn.setSourceAccount(sourceAccount.getId());
    txn.setSourceCurrency("CAD");
    txn.setDestinationCurrency("INR");
    txn.setDestinationAccount(destinationAccount.getId());
    txn.setAmount(100);
    //txn.setStatus(TransactionStatus.COMPLETED);
    //tx = (Transaction) ((Transaction) txnDAO.put_(x, tx)).fclone();
    txn = (Transaction) txnDAO.put_(x, txn);
  }

  public void createAccounts(X x) {

    //create users
    sender = (User) userDAO.find(EQ(User.EMAIL,"testuser1@nanopay.net" ));
    if ( sender == null ) {
      sender = new User();
      sender.setEmail("testUser1@nanopay.net");
      sender.setFirstName("Francis");
      sender.setLastName("Filth");
      sender.setEmailVerified(true);
      sender = (User) userDAO.put_(x, sender);
    }

    receiver = (User) userDAO.find(EQ(User.EMAIL,"testuser2@nanopay.net" ));
    if ( receiver == null ) {
      receiver = new User();
      receiver.setEmail("testUser2@nanopay.net");
      receiver.setFirstName("Francis");
      receiver.setLastName("Filth");
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

    destinationAccount = (INBankAccount) accountDAO.find(AND(EQ(BankAccount.OWNER, receiver.getId()), INSTANCE_OF(INBankAccount.class)));
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

  public void setupAscendantUser(X x){
    DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
    AscendantFXUser ascendantFXUser = (AscendantFXUser) ascendantFXUserDAO.find(EQ(AscendantFXUser.USER, sender.getId()));
    if ( null == ascendantFXUser ) ascendantFXUser = new AscendantFXUser.Builder(x).build();
    ascendantFXUser.setName(sender.getLegalName());
    ascendantFXUser.setUser(sender.getId());
    ascendantFXUser.setUserStatus(FXUserStatus.ACTIVE);
    ascendantFXUser.setOrgId("5904960");
    ascendantFXUserDAO.put_(x, ascendantFXUser);
  }

}
