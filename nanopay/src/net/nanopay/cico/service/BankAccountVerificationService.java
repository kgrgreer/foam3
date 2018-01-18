package net.nanopay.cico.service;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.pm.PM;
import java.io.IOException;
import net.nanopay.model.BankAccount;

public class BankAccountVerificationService
    extends    ContextAwareSupport
    implements BankAccountVerificationInterface
{
  protected DAO bankAccountDAO_;

  @Override
  public boolean verify(long bankAccountId, long randomDepositAmount)
      throws RuntimeException
  {
    PM pm = new PM(this.getClass(), "bankAccountVerify");

    try {

      /*if ( bankAccountId <= 0 ) {
        throw new RuntimeException("Invalid Bank Account Id");
      }

      if ( randomDepositAmount <= 0 ) {
        throw new RuntimeException("Please enter an amount between 0.00 and 1.00");
      }

      BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(bankAccountId);

      int verificationAttempts = bankAccount.getVerificationAttempts();

      if( bankAccount.getStatus() != "Disabled" && bankAccount.getRandomDepositAmount() != randomDepositAmount ) {
        verificationAttempts++;
        bankAccount.setVerificationAttempts(verificationAttempts);
        bankAccountDAO_.put(bankAccount);
        if ( bankAccount.getVerificationAttempts() == 3 ) {
          bankAccount.setStatus("Disabled");
          bankAccountDAO_.put(bankAccount);
        }
        if ( bankAccount.getVerificationAttempts() == 1 ) {
          throw new RuntimeException("Invalid amount, 2 attempts left.");
        }
        if ( bankAccount.getVerificationAttempts() == 2 ) {
          throw new RuntimeException("Invalid amount, 1 attempt left.");
        }
        if ( bankAccount.getVerificationAttempts() == 3 ) {
          throw new RuntimeException("Invalid amount, this account has been disabled for security reasons. Please contact customer support for help.");
        }
      }

      if ( bankAccount.getStatus() == "Disabled" ) {
        throw new RuntimeException("This account has been disabled for security reasons. Please contact customer support for help.");
      }

      if ( bankAccount.getStatus() == "Verified" ) {
        return true;
      }

      boolean isVerified = false;

      if ( bankAccount.getStatus() != "Disabled" && bankAccount.getRandomDepositAmount() == randomDepositAmount ) {
        bankAccount.setStatus("Verified");
        isVerified = true;

        bankAccountDAO_.put(bankAccount);
      }

      return isVerified;*/

      BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(bankAccountId);
      bankAccount.setStatus("Verified");
      bankAccountDAO_.put(bankAccount);
      return true;
    } finally {
      pm.log(getX());
    }
  }

  @Override
  public void start() {
    bankAccountDAO_ = (DAO) getX().get("localBankAccountDAO");
  }
}
