package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.liquidity.LiquiditySettings;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.FeeTransfer;
import net.nanopay.tx.Transfer;

import java.util.ArrayList;
import java.util.List;

import static foam.mlang.MLang.*;

public class GreenfenceTransactionTest
  extends foam.nanos.test.Test
{
  User buyer, seller;
  CABankAccount bank;
  DAO txnDAO;
  public void runTest(X x) {
    //create buyer user, create seller user under greenfence spid.
    txnDAO = (DAO) x.get("localTransactionDAO");
    createUsers(x);
    createBank(x);
    populateBuyerAccount(x);
    testInvoiceTxn(x);
  }

  public void testInvoiceTxn(X x) {
    GreenfenceTransaction greenTxn = new GreenfenceTransaction();
    greenTxn.setPayerId(buyer.getId());
    greenTxn.setPayeeId(seller.getId());
    LineItemType serviceType = (LineItemType) ((DAO) x.get("lineItemTypeDAO")).find(EQ(LineItemType.NAME, "Service"));
    LineItemType expenseType = (LineItemType) ((DAO) x.get("lineItemTypeDAO")).find(EQ(LineItemType.NAME, "Expense"));

    TransactionLineItem[] lineItems = new TransactionLineItem[] {new TransactionLineItem.Builder(x).setId(java.util.UUID.randomUUID().toString()).setType(serviceType.getId()).setAmount(500000).build(), new TransactionLineItem.Builder(x).setId(java.util.UUID.randomUUID().toString()).setAmount(100000).setType(expenseType.getId()).build()};
    greenTxn.setLineItems(lineItems);
    GreenfenceTransaction greenTx = (GreenfenceTransaction) ((DAO) x.get("localTransactionDAO")).put(greenTxn);
    DAO children1 = greenTx.getChildren(x);
    InvoiceTransaction tx = (InvoiceTransaction)((ArraySink) children1.select(new ArraySink())).getArray().get(0);
    Account greenfenceAcc = tx.findDestinationAccount(x);
    long initialGreenBalance = (long) greenfenceAcc.findBalance(x);
    test(greenTx instanceof GreenfenceTransaction, "tx instanceof InvoiceTransaction");
    test(greenTx.getStatus() == TransactionStatus.COMPLETED, "first transaction has status PENDING");
    test(tx.getStatus() == TransactionStatus.PENDING, "first transaction has status PENDING");
    test((long)greenfenceAcc.findBalance(x) == initialGreenBalance, "initial greenfenceBalance did not change");
    tx.setStatus(TransactionStatus.COMPLETED);
    Transaction tx1 = (Transaction) txnDAO.put(tx);
    DAO children = tx1.getChildren(x);
    List childArray = ((ArraySink) children.select(new ArraySink())).getArray();
    long value = 0;
    for ( int i = 0; i < tx1.getLineItems().length; i++ ) {
      TransactionLineItem lineItem = tx1.getLineItems()[i];
      if ( lineItem.getSourceAccount() == greenfenceAcc.getId() ) {
        value -= lineItem.getAmount();
      }
      if ( lineItem.getDestinationAccount() == greenfenceAcc.getId() ) {
        value += lineItem.getAmount();
      }
    }
    test((long)greenfenceAcc.findBalance(x) == initialGreenBalance + value, "initial greenfenceBalance increased by tx.getdestinationAmount");
    test(childArray.size() == 1 , "first transaction has only child");
    InvoiceTransaction tx2 = (InvoiceTransaction) childArray.get(0);
    test(tx2 instanceof InvoiceTransaction, "second transaction instanceof InvoiceTransaction");
    test(tx2.getStatus() == TransactionStatus.PENDING, "second transaction has status PENDING");
    tx2.setStatus(TransactionStatus.COMPLETED);
    tx2.setServiceCompleted(50);
    Transaction tx3 = (Transaction) txnDAO.put(tx2);
    long value2 = 0;
    for ( int i = 0; i < tx3.getLineItems().length; i++ ) {
      TransactionLineItem lineItem = tx3.getLineItems()[i];
      if ( lineItem.getSourceAccount() == greenfenceAcc.getId() ) {
        value2 -= lineItem.getAmount()*0.5;
      }
      if ( lineItem.getDestinationAccount() == greenfenceAcc.getId() ) {
        value2 += lineItem.getAmount()*0.5;
      }
    }
    test((long)greenfenceAcc.findBalance(x) == initialGreenBalance + value + value2, "after transaction is completed greenfence has initial status(plus fees)");
    GreenfenceTransaction greenNew = new GreenfenceTransaction();
    greenNew.setPayerId(buyer.getId());
    greenNew.setPayeeId(seller.getId());
    TransactionLineItem[] lineItems2 = new TransactionLineItem[] {new TransactionLineItem.Builder(x).setId(java.util.UUID.randomUUID().toString()).setType(serviceType.getId()).setAmount(40000).build(), new TransactionLineItem.Builder(x).setId(java.util.UUID.randomUUID().toString()).setAmount(30000).setType(expenseType.getId()).build()};
    greenNew.setLineItems(lineItems2);
    greenNew.setParent(greenTx.getId());
    txnDAO.put(greenNew);

  }
  public void createUsers(X x) {

    seller = (User) ((DAO)x.get("localUserDAO")).find(EQ(User.EMAIL,"greenfenceseller@nanopay.net" ));
    if ( seller == null ) {
      seller = new User();
      seller.setEmail("greenfenceseller@nanopay.net");
      //seller.setSpid("greenfence");
    }
    seller = (User) seller.fclone();
    seller.setEmailVerified(true);
    seller = (User) (((DAO) x.get("localUserDAO")).put_(x, seller)).fclone();

    buyer = (User) ((DAO)x.get("localUserDAO")).find(EQ(User.EMAIL,"greenfencebuyer@nanopay.net" ));
    if ( buyer == null ) {
      buyer = new User();
      buyer.setEmail("greenfencebuyer@nanopay.net");
      //buyer.setSpid("greenfence");
    }
    buyer = (User) buyer.fclone();
    buyer.setEmailVerified(true);
    buyer = (User) (((DAO) x.get("localUserDAO")).put_(x, buyer)).fclone();
  }

  public void populateBuyerAccount(X x) {
    Transaction txn = new Transaction();
    txn.setAmount(10000000L);
    txn.setSourceAccount(bank.getId());
    txn.setPayeeId(buyer.getId());
    txn = (Transaction) (((DAO) x.get("localTransactionDAO")).put_(x, txn)).fclone();
    txn.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x.get("localTransactionDAO")).put_(x, txn);
  }

  public void createBank(X x) {
    bank = (CABankAccount) ((DAO)x.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, buyer.getId()), INSTANCE_OF(CABankAccount.class)));
    if ( bank == null ) {
      bank = new CABankAccount();
      bank.setAccountNumber("213141275457645");
      bank.setOwner(buyer.getId());
    } else {
      bank = (CABankAccount)bank.fclone();
    }
    bank.setStatus(BankAccountStatus.VERIFIED);
    bank = (CABankAccount) ((DAO)x.get("localAccountDAO")).put_(x, bank).fclone();
  }

 }
