
package net.nanopay.tx.rbc;

import static foam.mlang.MLang.EQ;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.model.Branch;
import net.nanopay.payment.Institution;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;

public class RbcPlannerTest
    extends foam.nanos.test.Test {

  X x_;
  BankAccount testWrongBankAccount;
  BankAccount testBankAccount;
  DigitalAccount testDigitalAccount;
  User user;

  @Override
  public void runTest(X x) {
    x_ = x;

    setUpTest();
    testRbcCOTransaction();
    testRbcCITransaction();
    testWrongInstitution();
  }

  private void setUpTest() {
    user = addUser("planner1@rbcplannertest.ca");
    testBankAccount = createTestBankAccount(user.getId());
    testWrongBankAccount = createWrongTestBankAccount(user.getId());
    testDigitalAccount = createTestDigitalAccount(testBankAccount);
  }
  private User addUser(String email) {
    User user;
    DAO userDAO = (DAO) x_.get("localUserDAO");

    user = (User) userDAO.inX(x_).find(EQ(User.EMAIL, email));
    if (user == null) {
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
    return user;
  }

  private CABankAccount createTestBankAccount(long userId) {
    DAO bankAccountDao = (DAO) x_.get("accountDAO");
    CABankAccount account = (CABankAccount) bankAccountDao.find(EQ(CABankAccount.NAME, "RBC Test Account"));
    if ( account == null ) {
      final DAO  institutionDAO = (DAO) x_.get("institutionDAO");
      final DAO  branchDAO      = (DAO) x_.get("branchDAO");
      Institution institution = new Institution.Builder(x_)
        .setInstitutionNumber("003")
        .setName("RBC Test institution")
        .build();
      institution = (Institution) institutionDAO.put_(x_, institution);
    
      Branch branch = new Branch.Builder(x_)
        .setBranchId("00002")
        .setInstitution(institution.getId())
        .build();
      branch = (Branch) branchDAO.put_(x_, branch);
    
      BankAccount testBankAccount = new CABankAccount.Builder(x_)
        .setAccountNumber("12345678")
        .setBranch( branch.getId() )
        .setOwner(userId)
        .setName("RBC Test Account")
        .setStatus(BankAccountStatus.VERIFIED)
        .build();
    
      return (CABankAccount) bankAccountDao.put(testBankAccount);
    } else {
      return account;
    }
  }

  private USBankAccount createWrongTestBankAccount(long userId) {
    DAO bankAccountDao = (DAO) x_.get("accountDAO");
    USBankAccount account = (USBankAccount) bankAccountDao.find(EQ(USBankAccount.NAME, "Wrong RBC Test Account"));
    if ( account == null ) {
      final DAO  institutionDAO = (DAO) x_.get("institutionDAO");
      final DAO  branchDAO      = (DAO) x_.get("branchDAO");
      Institution institution = new Institution.Builder(x_)
        .setInstitutionNumber("999")
        .setName("Wrong RBC Test institution")
        .build();
      institution = (Institution) institutionDAO.put_(x_, institution);
    
      Branch branch = new Branch.Builder(x_)
        .setBranchId("12222")
        .setInstitution(institution.getId())
        .build();
      branch = (Branch) branchDAO.put_(x_, branch);
    
      BankAccount testBankAccount = new USBankAccount.Builder(x_)
        .setAccountNumber("12345678")
        .setBranch( branch.getId() )
        .setOwner(userId)
        .setInstitution(institution.getId())
        .setBranchId("123456789")
        .setName("Wrong RBC Test Account")
        .setStatus(BankAccountStatus.VERIFIED)
        .build();
    
      return (USBankAccount) bankAccountDao.put(testBankAccount);
    } else {
      return account;
    }
  }

  private DigitalAccount createTestDigitalAccount(BankAccount testBankAccount){
    DAO userDAO = (DAO) x_.get("localUserDAO");
    User user = (User) userDAO.find_(x_, testBankAccount.getOwner());
    DigitalAccount d =  (DigitalAccount) DigitalAccount.findDefault(x_, user, "CAD","7ee216ae-9371-4684-9e99-ba42a5759444").fclone();
    DAO dao = (DAO) x_.get("accountDAO");
    d = (DigitalAccount) (dao.put(d)).fclone();
    return d;
  }

  private Transaction createCOTransaction(BankAccount testBankAccount, DigitalAccount testDigitalAccount){
    return new Transaction.Builder(x_).setAmount(50000L)
      .setSourceAccount(testDigitalAccount.getId())
      .setDestinationAccount(testBankAccount.getId())
      .build();
  }

  private Transaction createCITransaction(BankAccount testBankAccount, DigitalAccount testDigitalAccount){
    return new Transaction.Builder(x_).setAmount(50000L)
      .setSourceAccount(testBankAccount.getId())
      .setDestinationAccount(testDigitalAccount.getId())
      .build();
  }

  public void testRbcCOTransaction() {

    TransactionQuote resultQuote = (TransactionQuote) ((DAO) x_.get("localTransactionPlannerDAO"))
      .put(createCOTransaction(testBankAccount,testDigitalAccount));

    test(resultQuote != null, "Result CO Quote is not null" );
    test(resultQuote.getPlans() != null && resultQuote.getPlans().length > 0, "Result CO Quote has plan" );
    
    boolean hasRbcCOTransaction = false;
    for ( Transaction plan : resultQuote.getPlans() ) {
      if ( plan instanceof RbcCOTransaction ) {
        hasRbcCOTransaction = true;
        break;
      }
    }
    test(hasRbcCOTransaction, "RBC CO Transaction was planned" );
  }

  public void testRbcCITransaction() {

    TransactionQuote resultQuote = (TransactionQuote) ((DAO) x_.get("localTransactionPlannerDAO"))
      .put(createCITransaction(testBankAccount,testDigitalAccount));

    test(resultQuote != null, "Result CI Quote is not null" );
    test(resultQuote.getPlans() != null && resultQuote.getPlans().length > 0, "Result CI Quote has plan" );
    
    boolean hasRbcCITransaction = false;
    for ( Transaction plan : resultQuote.getPlans() ) {
      if ( plan instanceof RbcCITransaction ) {
        hasRbcCITransaction = true;
        break;
      }
    }
    test(hasRbcCITransaction, "RBC CI Transaction was planned" );
  }

  public void testWrongInstitution() {

    try {
      TransactionQuote resultQuote = (TransactionQuote) ((DAO) x_.get("localTransactionPlannerDAO"))
      .put(createCITransaction(testWrongBankAccount,testDigitalAccount));
    } catch(Exception e) {
      test(true, "Unable to find a plan for requested transaction." );
    }
  }
}
