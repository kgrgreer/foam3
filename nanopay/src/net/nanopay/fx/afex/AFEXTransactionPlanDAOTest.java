
package net.nanopay.fx.afex;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import net.nanopay.bank.USBankAccount;
import net.nanopay.fx.FXSummaryTransaction;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.liquidity.LiquiditySettings;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.fx.FXService;
import foam.nanos.auth.Address;
import static foam.mlang.MLang.*;
import net.nanopay.payment.Institution;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.account.DigitalAccount;


public class AFEXTransactionPlanDAOTest
    extends foam.nanos.test.Test {

  private FXService fxService;
  protected DAO userDAO_;
  protected User user1 ;
  protected User user2;
  BankAccount user1USBankAccount;
  BankAccount user1CABankAccount;
  BankAccount user2USBankAccount;
  BankAccount user2CABankAccount;
  DAO localUserDAO;
  DAO localAccountDAO;
  DAO localtxDAO;
  DAO invoiceDAO;
  X x_;
  AFEXServiceProvider afexService;
  AFEXTransactionPlanDAO planDAO;

  @Override
  public void runTest(X x) {

    userDAO_ = (DAO) x.get("localUserDAO");
    x_ = x;

    setUpTest();
    cadToUSD();
    usdToUSD();
    usdToCAD();
  }

  private void setUpTest() {
    AFEX afex = new AFEXServiceMock(x_);
    afexService = new AFEXServiceProvider(x_, afex);
    planDAO = new AFEXTransactionPlanDAO.Builder(x_).build();

    localUserDAO = (DAO) x_.get("localUserDAO");
    localAccountDAO = (DAO) x_.get("localAccountDAO");
    Address businessAddress = new Address();
    businessAddress.setCity("Toronto");
    businessAddress.setCountryId("CA");

    user1 = new User();
    user1.setFirstName("AFEXPayer");
    user1.setLastName("AFEX");
    user1.setGroup("business");
    user1.setEmail("testAFEXTransaction@nanopay.net");
    user1.setBusinessAddress(businessAddress);
    user1.setAddress(businessAddress);
    user1.setEmailVerified(true);
    localUserDAO.put(user1);

    user2 = new User();
    user2.setFirstName("AFEXPayee");
    user2.setLastName("AFEX");
    user2.setGroup("business");
    user2.setEmail("testAFEXTransaction1@nanopay.net");
    user2.setBusinessAddress(businessAddress);
    user2.setAddress(businessAddress);
    user2.setEmailVerified(true);
    localUserDAO.put(user2);


    user1CABankAccount = new CABankAccount();
    user1CABankAccount.setAccountNumber("000000000000");
    user1CABankAccount.setInstitutionNumber("00000000000");
    user1CABankAccount.setOwner(user1.getId());
    user1CABankAccount.setDenomination("CAD");
    user1CABankAccount.setStatus(BankAccountStatus.VERIFIED);

    user2CABankAccount = new CABankAccount();
    user2CABankAccount.setAccountNumber("000000000001");
    user2CABankAccount.setInstitutionNumber("00000000000");
    user2CABankAccount.setOwner(user2.getId());
    user2CABankAccount.setDenomination("CAD");
    user2CABankAccount.setStatus(BankAccountStatus.VERIFIED);

    user1USBankAccount = new USBankAccount();
    user1USBankAccount.setAccountNumber("000000000002");
    user1USBankAccount.setInstitutionNumber("00000000000");
    user1USBankAccount.setOwner(user1.getId());
    user1USBankAccount.setDenomination("USD");
    user1USBankAccount.setStatus(BankAccountStatus.VERIFIED);

    user2USBankAccount = new USBankAccount();
    user2USBankAccount.setAccountNumber("000000000003");
    user2USBankAccount.setInstitutionNumber("00000000000");
    user2USBankAccount.setOwner(user2.getId());
    user2USBankAccount.setDenomination("USD");
    user2USBankAccount.setStatus(BankAccountStatus.VERIFIED);

    Institution institution = new Institution();
    DAO institutionDAO = (DAO) x_.get("institutionDAO");
    List institutions = ((ArraySink) institutionDAO
        .where(
            EQ(Institution.INSTITUTION_NUMBER, user2USBankAccount.getInstitutionNumber())
        )
        .select(new ArraySink())).getArray();

    if (institutions.isEmpty()) {
      institution = new Institution();
      institution.setName("AFEX Test institution");
      institution.setInstitutionNumber(user2USBankAccount.getInstitutionNumber());
      institution.setSwiftCode("22344421314124435333");
      institution.setCountryId("CA");
      institution = (Institution) institutionDAO.put(institution);
    } else {
      institution = (Institution) institutions.get(0);
    }
    user2USBankAccount.setInstitution(institution.getId());
    user2USBankAccount.setInstitution(institution.getId());
    user1CABankAccount.setInstitution(institution.getId());
    user2CABankAccount.setInstitution(institution.getId());

    localAccountDAO.put(user1CABankAccount);
    localAccountDAO.put(user2CABankAccount);
    localAccountDAO.put(user1USBankAccount);
    localAccountDAO.put(user2USBankAccount);


    DAO afexBusinessDAO = (DAO) x_.get("afexBusinessDAO");
    DAO afexBeneficiaryDAO = (DAO) x_.get("afexBeneficiaryDAO");

    AFEXBusiness b1 = new AFEXBusiness.Builder(x_)
      .setApiKey("abc123")
      .setAccountNumber("0001")
      .setUser(user1.getId())
      .setStatus("Active")
      .build();
    afexBusinessDAO.put(b1);

    AFEXBusiness b2 = new AFEXBusiness.Builder(x_)
      .setApiKey("123abc")
      .setAccountNumber("0002")
      .setUser(user2.getId())
      .setStatus("Active")
      .build();
    afexBusinessDAO.put(b2);

    AFEXBeneficiary beneficiary1 = new AFEXBeneficiary.Builder(x_)
      .setContact(user2.getId())
      .setOwner(user1.getId())
      .setStatus("Active")
      .build();
    afexBeneficiaryDAO.put(beneficiary1);

    AFEXBeneficiary beneficiary2 = new AFEXBeneficiary.Builder(x_)
      .setContact(user1.getId())
      .setOwner(user2.getId())
      .setStatus("Active")
      .build();
    afexBeneficiaryDAO.put(beneficiary2);

  }

  public void cashIn() {
    Transaction txn = new Transaction();
    txn.setAmount(100000L);
    txn.setSourceAccount(user1CABankAccount.getId());
    txn.setPayeeId(user1.getId());
    txn.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x_.get("localTransactionDAO")).put_(x_, txn);
  }

  public void cadToUSD(){
    cashIn();
    user1CABankAccount = (CABankAccount) localAccountDAO.find(user1CABankAccount.getId());

    TransactionQuote quote = new TransactionQuote.Builder(x_).build();
    Transaction transaction = new Transaction.Builder(x_).build();
    transaction.setPayerId(user1.getId());
    transaction.setSourceAccount(user1CABankAccount.getId());
    transaction.setPayeeId(user2.getId());
    transaction.setDestinationAccount(user2USBankAccount.getId());
    transaction.setDestinationAmount(100l);
    transaction.setSourceCurrency("CAD");
    transaction.setDestinationCurrency("USD");
    quote.setRequestTransaction(transaction);
    TransactionQuote resultQoute = (TransactionQuote) planDAO.generateTransaction(x_, quote, afexService);
    test( null != resultQoute, "CAD USD quote was processed" );

    Transaction tx1 = resultQoute.getPlans()[0];

    test( tx1 instanceof FXSummaryTransaction && tx1.getStatus() == TransactionStatus.COMPLETED, "FXSummary Transaction is first transaction for CAD to USD");

    Transaction tx2 = (tx1.getNext()[0]).getNext()[0];
    test( tx2 instanceof AFEXTransaction && tx2.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "AFEX Transaction is 3rd transaction");

    user2USBankAccount = (USBankAccount) localAccountDAO.find(user2USBankAccount);
    user1CABankAccount = (CABankAccount) localAccountDAO.find(user1CABankAccount);
    test(tx2.getSourceCurrency().equals("CAD"), "CAD USD Source Currency is CAD");
    test(tx2.getAmount() == 134l, "CAD USD Source amount is correct");
    test(tx2.getDestinationCurrency().equals("USD"), "CAD USD Source Currency is CAD");
    test(tx2.getDestinationAmount() == 100l, "CAD USD Destination amount is correct");
    test( tx2.getSourceAccount() == user1CABankAccount.getId(), "Corrent source bank account");
    test( tx2.getDestinationAccount() == user2USBankAccount.getId(), "Correct destination bank account");

  }

  public void usdToUSD(){

    TransactionQuote quote = new TransactionQuote.Builder(x_).build();
    Transaction transaction = new Transaction.Builder(x_).build();
    transaction.setPayerId(user2.getId());
    transaction.setSourceAccount(user2USBankAccount.getId());
    transaction.setPayeeId(user1.getId());
    transaction.setDestinationAccount(user1USBankAccount.getId());
    transaction.setDestinationAmount(50l);
    transaction.setSourceCurrency("USD");
    transaction.setDestinationCurrency("USD");
    quote.setRequestTransaction(transaction);
    TransactionQuote resultQoute = (TransactionQuote) planDAO.generateTransaction(x_, quote, afexService);
    test( null != resultQoute, "USD USD quote was processed" );

    Transaction tx1 = resultQoute.getPlans()[0];

    test( tx1 instanceof FXSummaryTransaction && tx1.getStatus() == TransactionStatus.COMPLETED, "FXSummary Transaction is first transaction for USD to USD");

    Transaction tx2 = (tx1.getNext()[0]).getNext()[0];
    test( tx2 instanceof AFEXTransaction && tx2.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "AFEX Transaction is 3rd transaction");

    user2USBankAccount = (USBankAccount) localAccountDAO.find(user2USBankAccount);
    user1CABankAccount = (CABankAccount) localAccountDAO.find(user1CABankAccount);
    test(tx2.getSourceCurrency().equals("USD"), "USD USD Source Currency is USD");
    test(tx2.getDestinationCurrency().equals("USD"), "USD USD Destination Currency is USD");
    test(tx2.getAmount() == tx2.getDestinationAmount() && tx2.getDestinationAmount() == 50l, "Source amount equals destination amount");
    test( tx2.getSourceAccount() == user2USBankAccount.getId(), "Corrent source bank account");
    test( tx2.getDestinationAccount() == user1USBankAccount.getId(), "Correct destination bank account");

  }

  public void usdToCAD(){

    TransactionQuote quote = new TransactionQuote.Builder(x_).build();
    Transaction transaction = new Transaction.Builder(x_).build();
    transaction.setPayerId(user2.getId());
    transaction.setSourceAccount(user2USBankAccount.getId());
    transaction.setPayeeId(user1.getId());
    transaction.setDestinationAccount(user1CABankAccount.getId());
    transaction.setDestinationAmount(66l);
    transaction.setSourceCurrency("USD");
    transaction.setDestinationCurrency("CAD");
    quote.setRequestTransaction(transaction);
    TransactionQuote resultQoute = (TransactionQuote) planDAO.generateTransaction(x_, quote, afexService);

    Transaction tx1 = resultQoute.getPlans()[0];

    test( tx1 instanceof FXSummaryTransaction && tx1.getStatus() == TransactionStatus.COMPLETED, "FXSummary Transaction is first transaction for USD to CAD");

    Transaction tx2 = (tx1.getNext()[0]).getNext()[0];
    test( tx2 instanceof AFEXTransaction && tx2.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "AFEX Transaction is 3rd transaction");

    user2USBankAccount = (USBankAccount) localAccountDAO.find(user2USBankAccount);
    user1CABankAccount = (CABankAccount) localAccountDAO.find(user1CABankAccount);
    test(tx2.getSourceCurrency().equals("USD"), "USD CAD Source Currency is USD");
    test(tx2.getAmount() == 49l, "USD CAD Source amount is correct");
    test(tx2.getDestinationCurrency().equals("CAD"), "USD CAD Destination Currency is CAD");
    test(tx2.getDestinationAmount() == 66l, "USD CAD Destination amount is correct");
    test( tx2.getSourceAccount() == user2USBankAccount.getId(), "Corrent source bank account");
    test( tx2.getDestinationAccount() == user1CABankAccount.getId(), "Correct destination bank account");

  }
}
