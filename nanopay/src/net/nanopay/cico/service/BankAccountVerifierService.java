package net.nanopay.cico.service;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.pm.PM;
import net.nanopay.model.BankAccount;

public class BankAccountVerifierService
    extends    ContextAwareSupport
    implements BankAccountVerifier, NanoService {
  protected DAO bankAccountDAO;

  @Override
  public boolean verify(long bankAccountId, long randomDepositAmount)
      throws RuntimeException {
    PM pm = new PM(this.getClass(), "bankAccountVerify");

    try {
      if (bankAccountId <= 0) {
        throw new RuntimeException("Invalid Bank Account Id");
      }

      if (randomDepositAmount <= 0) {
        throw new RuntimeException("Please enter an amount between 0.00 and 1.00");
      }

      BankAccount bankAccount = (BankAccount) bankAccountDAO.find(bankAccountId);

      int verificationAttempts = bankAccount.getVerificationAttempts();

      if (bankAccount.getStatus() != "Disabled" && bankAccount.getRandomDepositAmount() != randomDepositAmount) {
        verificationAttempts++;
        bankAccount.setVerificationAttempts(verificationAttempts);
        bankAccountDAO.put(bankAccount);
        if (bankAccount.getVerificationAttempts() == 3) {
          bankAccount.setStatus("Disabled");
          bankAccountDAO.put(bankAccount);
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

      if (bankAccount.getStatus() == "Disabled") {
        throw new RuntimeException("This account has been disabled for security reasons. Please contact customer support for help.");
      }

      if (bankAccount.getStatus() == "Verified") {
        return true;
      }

      boolean isVerified = false;

      if (bankAccount.getStatus() != "Disabled" && bankAccount.getRandomDepositAmount() == randomDepositAmount) {
        bankAccount.setStatus("Verified");
        isVerified = true;

        bankAccountDAO.put(bankAccount);
      }

      return isVerified;
    } finally {
      pm.log(getX());
    }
  }

  @Override
  public void start() {
    bankAccountDAO = (DAO) getX().get("localBankAccountDAO");
  }
}