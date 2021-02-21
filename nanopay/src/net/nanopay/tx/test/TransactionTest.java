package net.nanopay.tx.test;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import static net.nanopay.tx.model.TransactionStatus.COMPLETED;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.LoanAccount;
import net.nanopay.account.LoanedTotalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.fx.FXTransaction;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.payment.PADTypeLineItem;
import net.nanopay.tx.AbliiTransaction;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.bmo.cico.BmoVerificationTransaction;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.VerificationTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class TransactionTest
  extends foam.nanos.test.Test {
  X x_;
  User sender_;
  User receiver_;
  DigitalAccount sender_Dig;
  DigitalAccount receiver_Dig;
  CABankAccount sender_CA;
  CABankAccount receiver_CA;
  User loaneeTester;
  User loanerTester;
  DigitalAccount loaneeTester_Dig;
  DigitalAccount loanerTester_Dig;
  CABankAccount loaneeTester_CA;
  CABankAccount loanerTester_CA;
  DAO txnDAO;
  DAO accDAO;
  DAO txnQuoteDAO;
  DAO userDAO;
  DAO invDAO;
  Invoice inv;



  public void runTest(X x){
    x_ = x;
    txnDAO = (DAO) x_.get("localTransactionDAO");
    accDAO = (DAO) x_.get("localAccountDAO");
    invDAO = (DAO) x_.get("invoiceDAO");
    userDAO = (DAO) x_.get("localUserDAO");
    txnQuoteDAO = (DAO) x_.get("localTransactionPlannerDAO");

    sender_ = addUser("txntest1@transactiontest.caa");
    receiver_ = addUser("txntest2@transactiontest.caa");
    loaneeTester = addUser("loantest1@transactiontest.caa");
    loanerTester = addUser("loantest2@transactiontest.caa");
    inv = addInvoice(sender_,receiver_);
    setup();

    testAbliiTransaction();
    testPADType();
    testVerificationTransaction();
    testFXTransaction();
    //testLoanTransaction();
  }

  public void setup() {
    sender_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, sender_.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();
    sender_Dig = (DigitalAccount) (accDAO.find(
      AND(
        EQ(DigitalAccount.OWNER, sender_.getId()),
        INSTANCE_OF(DigitalAccount.class)))).fclone();

    receiver_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, receiver_.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();
    receiver_Dig = (DigitalAccount) (accDAO.find(
      AND(
        EQ(DigitalAccount.OWNER, receiver_.getId()),
        INSTANCE_OF(DigitalAccount.class)))).fclone();

    loaneeTester_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, loaneeTester.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();

    loanerTester_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, loanerTester.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();
    loanerTester_Dig = (DigitalAccount) (accDAO.find(
      AND(
        EQ(DigitalAccount.OWNER, loanerTester.getId()),
        INSTANCE_OF(DigitalAccount.class)))).fclone();

    loaneeTester_Dig = TransactionTestUtil.RetrieveDigitalAccount(x_, loaneeTester, "CAD", loanerTester_Dig);
  }

  public void testLoanTransaction(){
    test(! ( loanerTester_CA == null ), "funding account exists"  );
    Transaction fundtxn = new Transaction.Builder(x_)
      .setSourceAccount(loanerTester_CA.getId())
      .setDestinationAccount(loanerTester_Dig.getId())
      .setAmount(500000)
      .build();
    fundtxn = (Transaction) txnDAO.put(fundtxn).fclone();
    fundtxn.setStatus(COMPLETED);
    txnDAO.put(fundtxn);

    //create the loan account
    LoanAccount loanAccount = new LoanAccount.Builder(x_)
      .setOwner(loaneeTester.getId())
      .setRate(0.0)
      .setPrincipal(400000)
      .setDenomination("CAD")
      .setLenderAccount(loanerTester_Dig.getId())
      .build();
    loanAccount = (LoanAccount) accDAO.put(loanAccount);

    // get the global loan account
    LoanedTotalAccount globalAccount = (LoanedTotalAccount) accDAO.find(
      AND(
        EQ(LoanedTotalAccount.DENOMINATION,"CAD"),
        INSTANCE_OF(LoanedTotalAccount.class)));
    if( globalAccount == null )
      throw new RuntimeException("Global Loan Account not Found");
    long beforeLoanAmount = (long) globalAccount.findBalance(x_);

    //build the loan txn
    Transaction txn = new Transaction.Builder(x_)
      .setSourceAccount(loanAccount.getId())
      .setDestinationAccount(loaneeTester_Dig.getId())
      .setAmount(300000)
      .build();
    txn = (Transaction) txnDAO.put(txn).fclone();

    test(txn.getStatus() == COMPLETED,"Loan Transaction is completed");
    test((long) globalAccount.findBalance(x_) == beforeLoanAmount + txn.getAmount(),"Global Loan Account " + globalAccount.getId() + " Balance has been updated appropriately");
    test((long) loanAccount.findBalance(x_) == -300000,"the loan was recorded in the loan account, Balance: " + loanAccount.findBalance(x_) );
    test((long) loanerTester_Dig.findBalance(x_) == 200000,"the loan was recorded in the loan account, Balance: " + loanerTester_Dig.findBalance(x_) );
    test((long) loaneeTester_Dig.findBalance(x_) == 300000,"the loan was recorded in the loan account, Balance: " + loaneeTester_Dig.findBalance(x_) );

    // test trying to borrow more then allowed
    Transaction finalTxn = new Transaction.Builder(x_)
      .setSourceAccount(loanAccount.getId())
      .setDestinationAccount(loaneeTester_Dig.getId())
      .setAmount(100001)
      .build();

    try {
      txnDAO.put(finalTxn);
      test(false,"Exception: try to exceed principal");
    } catch (net.nanopay.tx.planner.UnableToPlanException e) {
      test(true, "try to exceed principal");
    } catch (RuntimeException e) {
      test(e.getMessage().contains("Transaction Exceeds Loan Account Principal Limit"), "try to exceed principal");
    }

    // test trying to repay more then borrowed
    Transaction payment = new Transaction.Builder(x_)
      .setSourceAccount(loanerTester_Dig.getId())
      .setDestinationAccount(loaneeTester_Dig.getId())
      .setAmount(100000)
      .build();
    txnDAO.put(payment);
    Transaction finalTxn2 = new Transaction.Builder(x_)
      .setSourceAccount(loaneeTester_Dig.getId())
      .setDestinationAccount(loanAccount.getId())
      .setAmount(300001)
      .build();

    try {
      txnDAO.put(finalTxn2);
      test(false,"Try to overpay loan");
    } catch (RuntimeException e) {
      test(e.toString().contains("Invalid transfer, LoanedTotalAccount account balance must remain >= 0"), "Try to overpay loan");
    }

  }

  public void testFXTransaction(){
    DigitalAccount uSdigital = (DigitalAccount) accDAO.find(
      AND(
        EQ(DigitalAccount.OWNER, receiver_.getId()),
        EQ(DigitalAccount.DENOMINATION,"USD"),
        INSTANCE_OF(DigitalAccount.class)));
    if (uSdigital == null) {
      uSdigital = new DigitalAccount.Builder(x_)
        .setOwner(receiver_.getId())
        .setDenomination("USD")
        .setTrustAccount("22")
        .build();
      uSdigital = (DigitalAccount) accDAO.put(uSdigital).fclone();
    }

    Transaction txn = new Transaction.Builder(x_)
      .setAmount(2000)
      .setDestinationAccount(uSdigital.getId())
      .setSourceAccount(sender_Dig.getId())
      .setDestinationCurrency(uSdigital.getDenomination())
      .setSourceCurrency(sender_Dig.getDenomination())
      .setPayerId(sender_.getId())
      .setPayeeId(receiver_.getId())
      .build();
    TransactionQuote tq = new TransactionQuote.Builder(x_)
      .setRequestTransaction(txn)
      .build();
    try {
      tq = (TransactionQuote) txnQuoteDAO.put(tq);
    } catch (Exception e) {
      System.out.println("@4 error: " + e);
    }

    test(tq.getPlan().getClass()== FXTransaction.class, "best plan is an "+tq.getPlan().getClass());
    test(tq.getPlan().getCost() !=0,"Plan cost is not 0, it is: " + String.valueOf(tq.getPlan().getCost()));

    test(tq.getPlan().getClass()==FXTransaction.class,"Transaction is of type FXTransaction");
    test(tq.getPlan().getStatus()== COMPLETED,"FXTransaction is in completed status");
    test(tq.getPlan().getNext()==null || tq.getPlan().getNext().length == 0 ,"FXTransaction is not chained");
  }

  public void testVerificationTransaction(){
    sender_CA.setStatus(BankAccountStatus.UNVERIFIED);
    sender_CA.setIsDefault(false);
    sender_CA = (CABankAccount) accDAO.put(sender_CA).fclone();

    BmoVerificationTransaction txn = new BmoVerificationTransaction.Builder(x_)
      .setPayerId(sender_.getId())
      .setDestinationAccount(sender_CA.getId())
      .setAmount(45)
      .setSourceCurrency(sender_CA.getDenomination())
      .build();
    Transaction txn2 = (Transaction) txnDAO.put(txn);

    test(txn2.getStatus()== TransactionStatus.PENDING,"verification transaction is "+txn.getStatus().toString());
    test(txn2.getTransfers().length == 0 ,"The verification transaction has "+txn.getTransfers().length+" transfers");
    // test(txn2.getLineItems().length == 0 ,"The verification transaction has "+txn.getLineItems().length+" line items");

    TransactionQuote tq = new TransactionQuote.Builder(x_)
      .setRequestTransaction(txn)
      .build();
    tq = (TransactionQuote) txnQuoteDAO.put(tq);

    test(tq.getPlans().length == 1,"Only 1 plan is created for an Verification Transaction");
    test(tq.getPlan() instanceof VerificationTransaction,"transaction is class of verification transaction");

    // reset senders account status ... used in other parts of this test
    sender_CA.setStatus(BankAccountStatus.VERIFIED);
    accDAO.put(sender_CA);
  }

  public void testAbliiTransaction(){
    AbliiTransaction txn = new AbliiTransaction.Builder(x_)
      .setSourceAccount(sender_CA.getId())
      .setDestinationAccount(receiver_CA.getId())
      .setSourceCurrency(sender_CA.getDenomination())
      .setDestinationCurrency(receiver_CA.getDenomination())
      .setPayeeId(receiver_.getId())
      .setPayerId(sender_.getId())
      .setInvoiceId(inv.getId())
      .setAmount(123)
      .setDestinationAmount(123)
      .build();

    TransactionQuote tq = new TransactionQuote();
    tq.setRequestTransaction(txn);
    tq = (TransactionQuote) txnQuoteDAO.put(tq).fclone();
    Transaction txn1 = tq.getPlan();
    test(txn1.getClass() == AbliiTransaction.class, "Parent transaction is of type AbliiTransaction");

    Transaction txn2 = txn1.getNext()[0];//compliance txn
    Transaction txn3 = txn2.getNext()[0];

    // Future with CompositeTransaction
    // test(txn3.getNext()[0].getClass() == AlternaCOTransaction.class, " 2nd child is of type "+txn3.getClass().getName()+" should be AlternaCOTransaction");

    // test(txn2.getAmount()== txn3.getNext()[0].getAmount(), "CI and CO transactions have same amount");
    // test(txn2.getDestinationAccount()==txn3.getSourceAccount(),"CI and CO use same digital account");
    // test(txn1.getDestinationAccount()==txn3.getDestinationAccount(), "txn1 and txn3 destination accounts are the same");

    // Non Composite
    Transaction txn4 = txn3.getNext()[0];
    Transaction txn5 = txn4.getNext()[0];
    test(txn3 instanceof CITransaction, " 2nd child is of type "+txn3.getClass().getName()+" should be CITransaction");
    test(txn4 instanceof DigitalTransaction," 3rd child is of type "+txn4.getClass().getName()+" should be DigitalTransaction");
    test(txn5 instanceof COTransaction, " 4th child is of type "+txn5.getClass().getName()+" should be COTransaction");

    test(txn3.getAmount()== txn5.getAmount(), "CI and CO transactions have same amount");
    test(txn3.getDestinationAccount()==txn4.getSourceAccount(),"CI and digital use same digital account");
    test(txn1.getDestinationAccount()==txn5.getDestinationAccount(), "txn1 and txn5 destination accounts are the same");

    test(txn1.getSourceAccount()==txn3.getSourceAccount(), "txn1 and txn3 source accounts are the same");
    test(txn1.getStatus() == COMPLETED," Ablii transaction is COMPLETED");
    test(txn3.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED," CI transaction is "+txn3.getStatus().getName()+ " should be PENDING_PARENT_COMPLETED");
    test(txn5.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED," CO transaction is "+txn5.getStatus().getName()+ " should be PENDING_PARENT_COMPLETED");

    // Transaction tx1 = (Transaction) ((DAO) x_.get("localTransactionDAO")).put_(x_,tq.getPlan()).fclone();
    // test(true,tx1.toString());
  }

  public void testPADType() {
    Transaction txn = new Transaction.Builder(x_)
      .setAmount(2000)
      .setDestinationAccount(sender_Dig.getId())
      .setSourceAccount(sender_CA.getId())
      .setDestinationCurrency(sender_Dig.getDenomination())
      .build();
    TransactionQuote tq = new TransactionQuote.Builder(x_)
      .setRequestTransaction(txn)
      .build();

    tq = (TransactionQuote) txnQuoteDAO.inX(x_).put(tq);
    txn = tq.getPlan();

    PADTypeLineItem padTypeLineItem = null;
    for (TransactionLineItem lineItem : txn.getLineItems()) {
      if ( lineItem instanceof PADTypeLineItem ) {
        padTypeLineItem = (PADTypeLineItem) lineItem;
      }
    }

    test(padTypeLineItem != null, "pad type line item must be set");
    if ( padTypeLineItem == null ) return;
    test(padTypeLineItem.getPadType() <= 0, "Quote plan should not set the default value");

    Transaction txn2 = new Transaction.Builder(x_)
      .setAmount(3000)
      .setDestinationAccount(sender_Dig.getId())
      .setSourceAccount(sender_CA.getId())
      .setDestinationCurrency(sender_Dig.getDenomination())
      .build();
    PADTypeLineItem.addTo(txn2, 700);
    tq = new TransactionQuote.Builder(x_)
      .setRequestTransaction(txn2)
      .build();

    tq = (TransactionQuote) txnQuoteDAO.inX(x_).put(tq);
    txn2 = tq.getPlan();

    test(PADTypeLineItem.getPADTypeFrom(x_, txn2).getId() == 700, "pad type set before quote");
  }

  public User addUser(String email) {
    User user;
    DigitalAccount dAcc1;
    CABankAccount bank;

    user = (User) userDAO.inX(x_).find(EQ(User.EMAIL, email));
    if ( user == null ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName("Francis");
      user.setLastName("Filth");
      user.setEmailVerified(true);
      user.setGroup("business");
      user.setSpid("test");
      user = (User) userDAO.put(user);
      user = (User) user.fclone();
    }

    dAcc1 = (DigitalAccount) accDAO.inX(x_).find(
      AND(
        EQ(DigitalAccount.OWNER, user.getId()),
        EQ(DigitalAccount.DENOMINATION, "CAD"),
        INSTANCE_OF(DigitalAccount.class)));
    if ( dAcc1 == null ) {
      dAcc1 = new DigitalAccount();
      dAcc1.setOwner(user.getId());
      dAcc1.setDenomination("CAD");
      accDAO.put(dAcc1);
    }

    bank = (CABankAccount) accDAO.inX(x_).find(
      AND(
        EQ(CABankAccount.OWNER, user.getId()),
        INSTANCE_OF(CABankAccount.class)));

    if ( bank == null ) {
      bank = new CABankAccount();
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setAccountNumber("12345678");
      bank.setInstitutionNumber("123");
      bank.setBranchId("12334");
      bank.setOwner(user.getId());
      accDAO.put(bank);
    }

    return user;
  }

  public Invoice addInvoice(User payer,User payee) {
    Invoice inv = new Invoice();
    inv.setDestinationCurrency("CAD");
    inv.setSourceCurrency("CAD");
    inv.setAmount(100L);
    inv.setScheduledEmailSent(false);
    inv.setPayeeId(payee.getId());
    inv.setPayerId(payer.getId());
    inv.setPaymentMethod(PaymentStatus.QUOTED);
    inv = (Invoice) invDAO.put(inv).fclone();
    return inv;
  }
}
