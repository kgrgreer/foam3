package net.nanopay.tx.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.fx.FXTransaction;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.AbliiTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.Transfer;
import net.nanopay.tx.alterna.AlternaCITransaction;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.alterna.AlternaVerificationTransaction;
import net.nanopay.tx.model.LiquiditySettings;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class TransactionTest
  extends foam.nanos.test.Test {
  X x_;
  User sender_;
  User receiver_;


  public void runTest(X x){
    x_ = x;
    sender_ = addUser("txnTest1@transactiontest.com");
    receiver_ = addUser("txnTest2@transactiontest.com");

    testTransactionMethods();
    testAbliiTransaction();
    testVerificationTransaction();
    testFXTransaction();
  }

  public void testFXTransaction(){
    User UStester = addUser("txnTest3@transactiontest.com");
    DigitalAccount USdigital = (DigitalAccount) ((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(DigitalAccount.OWNER, UStester.getId()),EQ(DigitalAccount.DENOMINATION,"USD"),INSTANCE_OF(DigitalAccount.class)));
    if (USdigital == null) {
      USdigital = new DigitalAccount.Builder(x_)
        .setOwner(UStester.getId())
        .setDenomination("USD")
        .build();
      USdigital = (DigitalAccount) ((DAO) x_.get("localAccountDAO")).put_(x_, USdigital).fclone();
    }

    DigitalAccount CAdigital = (DigitalAccount) ((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(DigitalAccount.OWNER, sender_.getId()),EQ(DigitalAccount.DENOMINATION,"CAD"),INSTANCE_OF(DigitalAccount.class)));

    Transaction txn = new Transaction.Builder(x_)
      .setAmount(2000)
      .setDestinationAccount(USdigital.getId())
      .setSourceAccount(CAdigital.getId())
      .setDestinationCurrency(USdigital.getDenomination())
      .build();
    TransactionQuote tq = new TransactionQuote.Builder(x_)
      .setRequestTransaction(txn)
      .build();

    tq = (TransactionQuote) ((DAO) x_.get("localTransactionQuotePlanDAO")).put_(x_, tq);
    test(tq.getPlan().getClass()== FXTransaction.class, "best plan is an "+tq.getPlan().getClass());
    test(tq.getPlan().getCost() !=0,String.valueOf(tq.getPlan().getCost()));
    //txn = (Transaction) ((DAO) x_.get("localTransactionDAO")).put_(x_, txn).fclone();
    test(tq.getPlan().getClass()==FXTransaction.class,"Transaction is of type FXTransaction");
    test(tq.getPlan().getStatus()==TransactionStatus.COMPLETED,"FXTransaction is in completed status");
    test(tq.getPlan().getNext()==null,"FXTransaction is not chained");
  }

  public void testVerificationTransaction(){
    CABankAccount bank = (CABankAccount) ((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(CABankAccount.OWNER, sender_.getId()),INSTANCE_OF(CABankAccount.class)) ).fclone();
    bank.setStatus(BankAccountStatus.UNVERIFIED);
    bank = (CABankAccount) ((DAO) x_.get("localAccountDAO")).put_(x_, bank).fclone();

    AlternaVerificationTransaction txn = new AlternaVerificationTransaction.Builder(x_)
      .setPayerId(sender_.getId())
      .setDestinationAccount(bank.getId())
      .setAmount(45)
      .setSourceCurrency(bank.getDenomination())
      .build();
    Transaction txn2 = (Transaction) ((DAO) x_.get("localTransactionDAO")).put_(x_, txn);

    test(txn2.getStatus()== TransactionStatus.PENDING,"verification transaction is "+txn.getStatus().toString());
    test(txn2.getTransfers().length == 0 ,"The verification transaction has "+txn.getTransfers().length+" transfers");
    test(txn2.getLineItems().length == 0 ,"The verification transaction has "+txn.getLineItems().length+" line items");

    TransactionQuote tq = new TransactionQuote.Builder(x_)
      .setRequestTransaction(txn)
      .build();
    tq = (TransactionQuote) ((DAO) x_.get("localTransactionQuotePlanDAO")).put_(x_, tq);

    test(tq.getPlan().getIsQuoted(),"verification transaction was quoted");
    test(tq.getPlans().length == 1,"Only 1 plan is created for an Alterna Verification Transaction");
    test(tq.getPlan().getClass() == AlternaVerificationTransaction.class,"transaction is class of Alterna verification transaction");
  }

  public void testAbliiTransaction(){
    Invoice inv = addInvoice(sender_,receiver_);

    AbliiTransaction txn = new AbliiTransaction.Builder(x_)
      .setPayeeId(receiver_.getId())
      .setPayerId(sender_.getId())
      .setSourceAccount(((CABankAccount) ((DAO) x_.get("localAccountDAO"))
        .find(AND(EQ(CABankAccount.OWNER,sender_.getId()),INSTANCE_OF(CABankAccount.class)))).getId())
      .setAmount(123)
      .build();

    TransactionQuote tq = new TransactionQuote();
    tq.setRequestTransaction(txn);
    tq = (TransactionQuote) ((DAO) x_.get("localTransactionQuotePlanDAO") ).put_(x_,tq).fclone();
    Transaction txn1 = tq.getPlan();
    test(txn1.getClass() == AbliiTransaction.class, "Parent transaction is of type AbliiTransaction");
    Transaction txn2 = txn1.getNext();
    test(txn2.getClass() == AlternaCITransaction.class, " 1st child is of type "+txn2.getClass().getName()+" should be AlternaCITransaction");
    Transaction txn3 = txn2.getNext();
    test(txn3.getClass() == AlternaCOTransaction.class, " 2nd child is of type "+txn2.getClass().getName()+" should be AlternaCOTransaction");

    test(txn2.getAmount()== txn3.getAmount(), "CI and CO transactions have same amount");
    test(txn2.getDestinationAccount()==txn3.getSourceAccount(),"CI and CO use same digital account");
    test(txn1.getDestinationAccount()==txn3.getDestinationAccount(), "txn1 and txn3 destination accounts are the same");
    test(txn1.getSourceAccount()==txn2.getSourceAccount(), "txn1 and txn2 source accounts are the same");
    test(txn1.getStatus() == TransactionStatus.COMPLETED," Ablii transaction is COMPLETED");
    test(txn2.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED," CI transaction is "+txn2.getStatus().getName()+" should be PENDING_PARENT_COMPLETED");
    test(txn3.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED," CO transaction is "+txn3.getStatus().getName()+" should be PENDING_PARENT_COMPLETED");

    // Transaction tx1 = (Transaction) ((DAO) x_.get("localTransactionDAO")).put_(x_,tq.getPlan()).fclone();
    // test(true,tx1.toString());
  }


  public void testTransactionMethods(){
    Invoice inv = addInvoice(sender_,receiver_);
    Transaction txn = new Transaction();

    txn.setAmount(1000000);
    txn.setSourceAccount( ((CABankAccount) (((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(CABankAccount.OWNER,sender_.getId()),INSTANCE_OF(CABankAccount.class))))).getId());
    txn.setDestinationAccount( ((DigitalAccount) (((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(DigitalAccount.OWNER, sender_.getId()),EQ(DigitalAccount.DENOMINATION,"CAD"),INSTANCE_OF(DigitalAccount.class))))).getId());
    txn = (Transaction) ((DAO) x_.get("localTransactionDAO")).put_(x_,txn).fclone();
    txn.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x_.get("localTransactionDAO")).put_(x_,txn);

    txn = new Transaction();
    txn.setInvoiceId(inv.getId());
    txn.setStatus(TransactionStatus.PAUSED);
    txn.setAmount(333);
    txn.setPayeeId(receiver_.getId());
    txn.setPayerId(sender_.getId());
    txn = (Transaction) ((DAO) x_.get("localTransactionDAO")).put_(x_,txn).fclone();

    test(txn.limitedClone(x_,null) == txn,"limited clone of null txn returns itself");
    Transaction txnNew = txn.limitedClone(x_,txn);

    test(txnNew.getAmount() == 333,"Amount not copied in LimitedClone");
    test(txnNew.getInvoiceId() == txn.getInvoiceId(),"Invoice IDs copied in LimitedClone");
    test(txnNew.getReferenceData() == txn.getReferenceData(),"Reference Data copied in LimitedClone");
    test(txnNew.getReferenceNumber() == txn.getReferenceNumber(),"Reference Number copied in LimitedClone");
    test(txnNew.getStatus() == txn.getStatus(),"Status copied in LimitedClone from "+txn.getStatus().getName() +" and "+ txnNew.getStatus().getName());
    test(! txn.isActive(), "isActive returns false");

    int amount = txn.getTransfers().length;
    Transfer transfer = new Transfer();
    Transfer transfer2 = new Transfer();
    Transfer[] transfers = new Transfer[2];
    transfers[0] = transfer;
    transfers[1] = transfer2;

    test(txn.getTransfers().length == amount, "new Transaction has no transfers");
    txn.add(transfers);
    test(txn.getTransfers().length == 2+amount, "2 Transfers added successfully");
    txn.add(transfers);
    test(txn.getTransfers().length == 4+amount, "2 more Transfers added successfully");
    txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
    test( ! txn.canTransfer(x_,null), "Cannot transfer transaction in PENDING_PARENT_COMPLETED status");
    txn.setStatus(TransactionStatus.PENDING);
    test(txn.canTransfer(x_, null),"Can transfer transaction if previous transaction is null");
    txnNew.setStatus(TransactionStatus.PENDING);
    test( ! txn.canTransfer(x_,txnNew),"Cannot transfer transaction in same status as old transaction");
    test( ! txn.canReverseTransfer(x_,txn), "canReverseTransfer returns false");

  }

  public User addUser(String Email) {
    User user = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, Email));
    if ( user == null ) {
      user = new User();
      user.setEmail(Email);
      user.setEmailVerified(true);
      user = (User) (((DAO) x_.get("localUserDAO")).put_(x_, user)).fclone();
    }
    DigitalAccount dAcc1 = (DigitalAccount) ((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(DigitalAccount.OWNER, user.getId()),EQ(DigitalAccount.DENOMINATION,"CAD"),INSTANCE_OF(DigitalAccount.class)));
    if ( dAcc1 == null ) {
      dAcc1 = new DigitalAccount();
      dAcc1.setOwner(user.getId());
      dAcc1.setDenomination("CAD");
      ((DAO) x_.get("localAccountDAO")).put_(x_, dAcc1);
    }
    CABankAccount bank = (CABankAccount) ((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(CABankAccount.OWNER, user.getId()),INSTANCE_OF(CABankAccount.class)) );
    if ( bank == null ) {
      bank = new CABankAccount();
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setAccountNumber("12345678");
      bank.setOwner(user.getId());
      ((DAO) x_.get("localAccountDAO")).put_(x_, bank);
    }
    LiquiditySettings ls = new LiquiditySettings();
    ls.setId(DigitalAccount.findDefault(x_, user, "CAD").getId());
    ls.setEnableCashIn(false);
    ls.setEnableCashOut(false);
    ((DAO)x_.get("liquiditySettingsDAO")).put(ls);
    return user;
  }


  public Invoice addInvoice(User payer,User payee){
    Invoice inv = new Invoice();
    inv.setDestinationCurrency("CAD");
    inv.setSourceCurrency("CAD");
    inv.setAmount(100L);
    inv.setScheduledEmailSent(false);
    inv.setPayeeId(payee.getId());
    inv.setPayerId(payer.getId());
    inv = (Invoice) ( (DAO) x_.get("invoiceDAO") ).put_(x_,inv).fclone();

    return inv;
  }
}
