package net.nanopay.kotak;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.INBankAccount;
import net.nanopay.model.Branch;
import net.nanopay.payment.Institution;
import net.nanopay.tx.KotakCOTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.EQ;

public class KotakTest implements ContextAgent {

  @Override
  public void execute(X x) {
    testKotak(x);
  }


  private void testKotak(X x) {
    INBankAccount testBankAccount = createTestBankAccount(x);
    DigitalAccount testDigitalAccount = createTestDigitalAccount(x, testBankAccount);
    KotakCOTransaction testKotakCOTransaction = createTestCOTransaction(x, testBankAccount, testDigitalAccount);
    // CITransaction CITransaction = createTestCITransaction(x, testBankAccount, testDigitalAccount);
  }

  public INBankAccount createTestBankAccount(foam.core.X x) {

    DAO bankAccountDao = (DAO)x.get("accountDAO");

    INBankAccount account = (INBankAccount) bankAccountDao.find(EQ(INBankAccount.NAME, "Kotak Test Account"));

    if ( account == null ) {
      final DAO  institutionDAO = (DAO) x.get("institutionDAO");
      final DAO  branchDAO      = (DAO) x.get("branchDAO");

      Institution institution = new Institution.Builder(x)
        .setInstitutionNumber("999")
        .setName("Kotak Test institution")
        .build();
      institution = (Institution) institutionDAO.put_(x, institution);

      Branch branch = new Branch.Builder(x)
        .setBranchId("99999")
        .setInstitution(institution.getId())
        .build();
      branch = (Branch) branchDAO.put_(x, branch);

      BankAccount testBankAccount = new INBankAccount.Builder(x)
        .setAccountNumber("123456789")
        .setBranch( branch.getId() )
        .setOwner(1348)
        .setName("Kotak Test Account")
        .setStatus(BankAccountStatus.VERIFIED)
        .build();

      return (INBankAccount) bankAccountDao.put(testBankAccount);
    } else {
      return account;
    }

  }

  public net.nanopay.account.DigitalAccount createTestDigitalAccount(foam.core.X x, net.nanopay.bank.INBankAccount testBankAccount) {

    DAO userDAO        = (DAO) x.get("localUserDAO");
    User user = (User) userDAO.find_(x, testBankAccount.getOwner());
    return DigitalAccount.findDefault(x, user, "INR");

  }

//  public CITransaction createTestCITransaction(foam.core.X x, net.nanopay.bank.INBankAccount testBankAccount, net.nanopay.account.DigitalAccount testDigitalAccount) {
//
//    Logger logger = (Logger) x.get("logger");
//    DAO transactionDAO = (DAO)x.get("localTransactionDAO");
//    DAO planDAO = (DAO)x.get("localTransactionQuotePlanDAO");
//
//    Transaction requestTransaction = new Transaction.Builder(x)
//      //.setStatus(TransactionStatus.PENDING)
//      .setAmount(1000)
//      //.setSourceAccount(testDigitalAccount.getId())
//      .setSourceAccount(testBankAccount.getId())
//      .setDestinationAccount(testDigitalAccount.getId())
//      .build();
//
//    TransactionQuote quote = new TransactionQuote.Builder(x).setRequestTransaction(requestTransaction).build();
//    quote = (TransactionQuote) planDAO.put(quote);
//    Transaction plan = quote.getPlan();
//    // test ( plan != null, "Plan transaction is not null");
//    // test ( plan instanceof KotakCOTransaction, "Plan transaction instance of KotakCOTransaction" );
//    //logger.info("createTestCITransaction bank", testBankAccount, "digital", testDigitalAccount);
//    if ( plan instanceof CITransaction) {
//      System.out.println("createTestCOtransaction before initial put status: " + plan.getStatus());
//      plan = (Transaction) transactionDAO.put(plan);
//      System.out.println("createTestCOtransaction after initial put status: " + plan.getStatus());
//      return (CITransaction) plan;
//    }
//    throw new RuntimeException("Plan transaction not instance of KotakCOTransaction. transaction: " + plan);
//
//  }

  public KotakCOTransaction createTestCOTransaction(foam.core.X x, net.nanopay.bank.INBankAccount testBankAccount, net.nanopay.account.DigitalAccount testDigitalAccount) {

    Logger logger = (Logger) x.get("logger");
    DAO    userDAO        = (DAO) x.get("localUserDAO");

    DAO transactionDAO = (DAO)x.get("localTransactionDAO");
    DAO planDAO = (DAO)x.get("localTransactionQuotePlanDAO");

    User payee = new User();
    payee.setId(1368);
    payee.setFirstName("Payee");
    payee.setLastName("Kotak");
    payee.setEmail("test@mailinator.com");
//    payee.setGroup("business");
    payee = (User) userDAO.put_(x, payee);

    Transaction requestTransaction = new Transaction.Builder(x)
      //.setStatus(TransactionStatus.PENDING)
      .setAmount(150)
      .setSourceAccount(testDigitalAccount.getId())
      //.setSourceAccount(5)
      .setDestinationAccount(testBankAccount.getId())
      .setPayeeId(payee.getId())
      .build();

    TransactionQuote quote = new TransactionQuote.Builder(x).setRequestTransaction(requestTransaction).build();
    quote = (TransactionQuote) planDAO.put(quote);
    Transaction plan = quote.getPlan();
    // test ( plan != null, "Plan transaction is not null");
    // test ( plan instanceof KotakCOTransaction, "Plan transaction instance of KotakCOTransaction" );
    //logger.info("createTestCITransaction bank", testBankAccount, "digital", testDigitalAccount);
    if ( plan instanceof KotakCOTransaction ) {
      System.out.println("createTestCOtransaction before initial put status: " + plan.getStatus());
      plan = (Transaction) transactionDAO.put(plan);
      System.out.println("createTestCOtransaction after initial put status: " + plan.getStatus());
      return (KotakCOTransaction) plan;
    }
    throw new RuntimeException("Plan transaction not instance of KotakCOTransaction. transaction: " + plan);

  }
}
