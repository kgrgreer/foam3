package net.nanopay.tx.bmo;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.payment.PADTypeLineItem;
import net.nanopay.tx.bmo.cico.BmoCITransaction;
import net.nanopay.tx.bmo.cico.BmoCOTransaction;
import net.nanopay.tx.model.TransactionStatus;

/**
 * This class is only used for generate the one off BmoTransaction, once we have the BmoTransactionPlanDAO,
 * We will use BmoTransactionPlanDAO to create the BmoTransaction.
 *
 * We can always use this class to do the test.
 */
public class BmoOneOffTest {

  X x;
  DAO userDAO;
  DAO accountDAO;
  DAO transactionDAO;

  public BmoOneOffTest(X x) {
    this.x              = x;
    this.userDAO        = (DAO) x.get("localUserDAO");
    this.accountDAO     = (DAO) x.get("localAccountDAO");
    this.transactionDAO = (DAO) x.get("transactionDAO");
  }

  public void testCI(String email, long amount, int padType) {
    User testUser                 = getUser(email);
    CABankAccount bankAccount     = getBankAccount(testUser);
    DigitalAccount digitalAccount = getDigitalAccount(testUser);

    BmoCITransaction ciTransaction = new BmoCITransaction();
    ciTransaction.setStatus              (TransactionStatus.PENDING);
    ciTransaction.setInitialStatus       (TransactionStatus.PENDING);
    ciTransaction.setPayeeId             (testUser.getId());
    ciTransaction.setPayerId             (testUser.getId());
    ciTransaction.setAmount              (amount);
    ciTransaction.setSourceCurrency      ("CAD");
    ciTransaction.setDestinationCurrency ("CAD");
    ciTransaction.setSourceAccount       (bankAccount.getId());
    ciTransaction.setDestinationAccount  (digitalAccount.getId());
    PADTypeLineItem.addTo(ciTransaction, padType);

    transactionDAO.inX(x).put(ciTransaction);
  }

  public void testCO(String email, long amount, int padType ) {
    User testUser                 = getUser(email);
    CABankAccount bankAccount     = getBankAccount(testUser);
    DigitalAccount digitalAccount = getDigitalAccount(testUser);

    BmoCOTransaction coTransaction = new BmoCOTransaction();
    coTransaction.setStatus              (TransactionStatus.PENDING);
    coTransaction.setInitialStatus       (TransactionStatus.PENDING);
    coTransaction.setPayeeId             (testUser.getId());
    coTransaction.setPayerId             (testUser.getId());
    coTransaction.setAmount              (amount);
    coTransaction.setSourceCurrency      ("CAD");
    coTransaction.setDestinationCurrency ("CAD");
    coTransaction.setSourceAccount       (digitalAccount.getId());
    coTransaction.setDestinationAccount  (bankAccount.getId());
    PADTypeLineItem.addTo(coTransaction, padType);

    transactionDAO.inX(x).put(coTransaction);
  }

  public User getUser(String email) {
    User testUser = (User) userDAO.inX(x).find(MLang.EQ(User.EMAIL, email));
    if ( testUser == null ) {
      throw new RuntimeException("test user do not exist");
    }
    return testUser;
  }

  public CABankAccount getBankAccount(User testUser) {
    CABankAccount bankAccount = (CABankAccount) accountDAO.inX(x).find(MLang.AND(
      MLang.EQ(CABankAccount.OWNER, testUser.getId()),
      MLang.INSTANCE_OF(CABankAccount.getOwnClassInfo())
    ));
    if ( bankAccount == null ) {
      throw new RuntimeException("bank account do not exist");
    }
    return bankAccount;
  }

  public DigitalAccount getDigitalAccount(User testUser) {
    DigitalAccount digitalAccount = (DigitalAccount) accountDAO.inX(x).find(MLang.AND(
      MLang.EQ(DigitalAccount.OWNER, testUser.getId()),
      MLang.INSTANCE_OF(DigitalAccount.getOwnClassInfo())
    ));
    return digitalAccount;
  }
}
