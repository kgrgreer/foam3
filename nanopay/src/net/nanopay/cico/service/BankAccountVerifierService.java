package net.nanopay.cico.service;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

import java.util.Date;
import java.util.List;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.model.Transaction;
import foam.util.SafetyUtil;

public class BankAccountVerifierService
    extends    ContextAwareSupport
    implements BankAccountVerifier, NanoService {
  protected DAO bankAccountDAO;

  @Override
  public boolean verify(X x, String bankAccountId, long randomDepositAmount)
      throws RuntimeException {
    // To test auto depoit of the ablii app
    if ( randomDepositAmount == -1000000 ) {
      BankAccount bankAccount = (BankAccount) bankAccountDAO.inX(x).find(bankAccountId);
      bankAccount.setStatus(BankAccountStatus.VERIFIED);
      bankAccount.setVerifiedBy("MICRO_DEPOSIT");
      bankAccount = (BankAccount) bankAccountDAO.inX(x).put(bankAccount);
      if ( bankAccount != null) checkPendingAcceptanceInvoices(x, bankAccount);
      return true;
    }

    PM pm = new PM(this.getClass(), "bankAccountVerify");

    try {
      if ( SafetyUtil.isEmpty(bankAccountId) ) {
        throw new RuntimeException("Invalid Bank Account Id");
      }

      if (randomDepositAmount <= 0) {
        throw new RuntimeException("Please enter an amount between 0.00 and 1.00");
      }

      BankAccount bankAccount = (BankAccount) bankAccountDAO.find(bankAccountId);
      bankAccount = (BankAccount) bankAccount.fclone();

      int verificationAttempts = bankAccount.getVerificationAttempts();

      if ( ! BankAccountStatus.DISABLED.equals(bankAccount.getStatus()) && bankAccount.getRandomDepositAmount() != randomDepositAmount) {
        verificationAttempts++;
        bankAccount.setVerificationAttempts(verificationAttempts);
        bankAccountDAO.inX(x).put(bankAccount);
        if (bankAccount.getVerificationAttempts() == 3) {
          bankAccount.setStatus(BankAccountStatus.DISABLED);
          bankAccountDAO.inX(x).put(bankAccount);
        }
        if (bankAccount.getVerificationAttempts() == 1) {
          throw new RuntimeException("Invalid amount, 2 attempts left.");
        }
        if (bankAccount.getVerificationAttempts() == 2) {
          throw new RuntimeException("Invalid amount, 1 attempt left.");
        }
        if (bankAccount.getVerificationAttempts() == 3) {
          throw new RuntimeException("Invalid amount, this account has been disabled for security reasons. Please contact customer support for help.");
        }
      }

      if ( BankAccountStatus.DISABLED.equals(bankAccount.getStatus()) ) {
        throw new RuntimeException("This account has been disabled for security reasons. Please contact customer support for help.");
      }

      if ( BankAccountStatus.VERIFIED.equals(bankAccount.getStatus()) ) {
        return true;
      }

      boolean isVerified = false;

      if ( ! BankAccountStatus.DISABLED.equals(bankAccount.getStatus()) && bankAccount.getRandomDepositAmount() == randomDepositAmount) {
        bankAccount.setStatus(BankAccountStatus.VERIFIED);
        bankAccount.setMicroVerificationTimestamp(new Date());
        isVerified = true;
        bankAccount = (BankAccount) bankAccountDAO.inX(x).put(bankAccount);
        checkPendingAcceptanceInvoices(x, bankAccount);
      }

      return isVerified;
    } finally {
      pm.log(x);
    }
  }

  @Override
  public void start() {
    bankAccountDAO = (DAO) getX().get("localAccountDAO");
  }

  private void checkPendingAcceptanceInvoices(X x, BankAccount bankAccount) {
    // Automation of transfer, where invoice payment
    //  has been in Holding (payer's default digital account)
    try {
      AuthService auth = (AuthService) x.get("auth");
      if ( auth.check(x, "invoice.holdingAccount") ) {
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        DAO userDAO = (DAO) x.get("userDAO");
        User currentUser = null;
        try {
          currentUser = (User) userDAO.find(bankAccount.getOwner());
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.log(e);
        }
        if ( currentUser == null ) return;

        List pendAccInvoice = ((ArraySink)invoiceDAO.where(AND(
            EQ(Invoice.DESTINATION_CURRENCY, bankAccount.getDenomination()),
            EQ(Invoice.PAYEE_ID, currentUser.getId()),
            EQ(Invoice.STATUS, InvoiceStatus.PENDING_ACCEPTANCE)
          )).select(new ArraySink())).getArray();
        Transaction txn = null;
        Invoice inv = null;

        for( int i = 0; i < pendAccInvoice.size(); i++ ) {
          // For each found invoice with the above mlang conditions
          // make a transaction to Currently verified Bank Account
          inv = (Invoice) pendAccInvoice.get(i);
          txn = new Transaction();
          txn.setPayeeId(inv.getPayeeId());
          txn.setPayerId(inv.getPayerId());
          txn.setSourceAccount(inv.getDestinationAccount());
          txn.setDestinationAccount(bankAccount.getId());
          txn.setInvoiceId(inv.getId());
          txn.setAmount(inv.getAmount());

          transactionDAO.put(txn);
        }
      }
    } catch(Exception e) {
      Logger logger = (Logger) x.get("logger");
      logger.error("AUTO DEPOSIT TO --- FAILED" );
    }

  }
}
