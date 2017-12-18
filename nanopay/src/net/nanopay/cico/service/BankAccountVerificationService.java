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

      if ( bankAccountId <= 0 ) {
        throw new RuntimeException("Invalid Bank Account Id");
      }

      BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(bankAccountId);

      if ( bankAccount.getStatus() == "Disabled" ) {
        throw new RuntimeException("This account has been disabled for security reasons. Delete this account and add another or contact customer support for help.");
      }

      if ( randomDepositAmount <= 0 ) {
        throw new RuntimeException("Please enter an amount between 0.00 and 1.00");
      }

      if ( bankAccount.getStatus() == "Verified" ) {
        return true;
      }

      boolean isVerified = false;

      if ( bankAccount.getVerificationAttempts() > 2 ) {
        bankAccount.setStatus("Disabled");
      }

      if ( bankAccount.getStatus() != "Disabled" && bankAccount.getRandomDepositAmount() == randomDepositAmount ) {
        bankAccount.setStatus("Verified");
        isVerified = true;

        bankAccountDAO_.put(bankAccount);
      }

      return isVerified;
    } finally {
      pm.log(getX());
    }
  }

  @Override
  public void start() {
    bankAccountDAO_ = (DAO) getX().get("bankAccountDAO");
  }
}
