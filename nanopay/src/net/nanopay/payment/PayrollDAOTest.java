package net.nanopay.payment;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;

public class PayrollDAOTest extends foam.nanos.test.Test {
  long PAYER_ID, PAYER_ACCOUNT;
  String PAYER_EMAIL = "payroll@nanopay.net";
  DAO payrollDAO, userDAO, accountDAO, txnDAO;
  Payroll payroll;
  long[] payeeIds = new long[3];
  int payeeIndex = 0;
  PayrollEntry[] entries = new PayrollEntry[3];
  int entryIndex = 0;
  double amount = 100;

  public void runTest(X x) {
    payrollDAO = (DAO) x.get("payrollDAO");
    userDAO = (DAO) x.get("localUserDAO");
    accountDAO = (DAO) x.get("localAccountDAO");
    txnDAO = (DAO) x.get("localTransactionDAO");
    test(payrollDAO != null, "payrollDAO has been configured.");

    createPayerIfNotFound(x);
    addSourceAccountIfNotFound(x);
    addPayeesIfNotFound(x);
    addPayrollEntries(x);
    payroll = new Payroll();
    payroll.setSourceAccount(PAYER_ACCOUNT);
    payroll.setPayrollEntries(entries);

    Payroll addedPayroll = (Payroll) payrollDAO.put_(x, payroll);
    test( addedPayroll != null && addedPayroll.getId() == payroll.getId() ,"payrollDAO put_ is successful.");

    Payroll foundPayroll = (Payroll) payrollDAO.find_(x, payroll.getId());
    test( foundPayroll != null && foundPayroll.getId() == payroll.getId(), "payrollDAO find_ is successful" );

    amount = 100;
    for( long payeeId : payeeIds ) {
      Transaction txn = (Transaction) txnDAO.find(
        AND(
          EQ(Transaction.SOURCE_ACCOUNT, PAYER_ACCOUNT),
          EQ(Transaction.DESTINATION_ACCOUNT, DigitalAccount.findDefault(x, (User) userDAO.find(payeeId), "CAD").getId()),
          EQ(Transaction.AMOUNT, amount)
        )
      );
      test (txn != null, "Transaction paid to " + payeeId + " exists.");
      amount += 100;
    }

    Payroll removedPayroll = (Payroll) payrollDAO.remove_(x, payroll);
    test( payrollDAO.find_(x, removedPayroll.getId()) == null, "payrollDAO remove_ is successful.");
  }

  public void addSourceAccountIfNotFound(X x) {
    CABankAccount account = (CABankAccount) accountDAO.find(
      AND(
        EQ(BankAccount.OWNER, PAYER_ID),
        INSTANCE_OF(CABankAccount.class),
        EQ(BankAccount.IS_DEFAULT, true),
        EQ(BankAccount.DENOMINATION, "CAD")
      )
    );
    if ( account == null ) {
      account = new CABankAccount();
      account.setBranchId("12345");
      account.setInstitutionNumber("123");
      account.setAccountNumber("1234543");
      account.setStatus(BankAccountStatus.VERIFIED);
      account.setOwner(PAYER_ID);
      account.setDenomination("CAD");
      account.setEnabled(true);
      account.setIsDefault(true);
      account = (CABankAccount) accountDAO.put_(x, account);
    }
    PAYER_ACCOUNT = account.getId();
  }

  public void createPayerIfNotFound(X x) {
    User user = (User) userDAO.find(EQ(User.EMAIL, PAYER_EMAIL));
    if ( user == null ) {
      user = new User();
      user.setFirstName("payroll");
      user.setLastName("payer");
      user.setEmail(PAYER_EMAIL);
      user.setEmailVerified(true);
      user = (User) userDAO.put_(x, user);
    }
    PAYER_ID = user.getId();
  }

  public void addPayeesIfNotFound(X x) {
    addPayeeIfNotFound(x, "FrancisOne", "francis1@nanopay.net", "001", "12345", "1234567");
    addPayeeIfNotFound(x, "FrancisTwo", "francis2@nanopay.net", "002", "12346", "1234568");
    addPayeeIfNotFound(x, "FrancisThree", "francis3@nanopay.net", "003", "12347", "1234569");
  }

  public void addPayeeIfNotFound(X x, String firstName, String email, String institutionNo, String branchId, String bankAccountNo) {
    User user = (User) userDAO.find(EQ(User.EMAIL, email));
    if ( user == null ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName(firstName);
      user.setLastName("Filth");
      user.setEmailVerified(true);
      user = (User) userDAO.put_(x, user);
    }
    long userId = user.getId();
    payeeIds[payeeIndex] =  userId;
    ++payeeIndex;

    addBankAccountIfNotFound(x, userId, institutionNo, branchId, bankAccountNo);
  }

  public void addBankAccountIfNotFound(X x, long owner, String institutionNo, String branchId, String bankAccountNo) {
    CABankAccount account = (CABankAccount) accountDAO.find(
      AND(
        EQ(BankAccount.OWNER, owner),
        INSTANCE_OF(CABankAccount.class),
        EQ(BankAccount.IS_DEFAULT, true),
        EQ(BankAccount.DENOMINATION, "CAD")
      )
    );
    if ( account == null ) {
      account = new CABankAccount();
      account.setOwner(owner);
      account.setInstitutionNumber(institutionNo);
      account.setBranchId(branchId);
      account.setAccountNumber(bankAccountNo);
      account.setIsDefault(true);
      account.setDenomination("CAD");
      accountDAO.put_(x, account);
    }
  }

  public void addPayrollEntries(X x) {
    for (long payeeId : payeeIds) {
      addPayrollEntry(x, payeeId);
   }
  }

  public void addPayrollEntry(X x, long payeeId) {
    User payee = (User) userDAO.find(payeeId);
    CABankAccount bankAccount = (CABankAccount) BankAccount.findDefault(x, payee, "CAD");
    PayrollEntry entry = new PayrollEntry();
    entry.setOwner(payeeId);
    entry.setEmail(payee.getEmail());
    entry.setFirstName(payee.getFirstName());
    entry.setLastName(payee.getLastName());
    entry.setInstitutionNo(bankAccount.getInstitutionNumber());
    entry.setBranchId(bankAccount.getBranchId());
    entry.setBankAccountNo(bankAccount.getAccountNumber());
    entry.setAmount(amount);
    amount += 100;

    entries[entryIndex] = entry;
    ++entryIndex;
  }
 }
