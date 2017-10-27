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

    if ( bankAccountId <= 0 ) {
      throw new RuntimeException("Invalid Bank Account Id");
    }

    if ( randomDepositAmount <= 0 ) {
      throw new RuntimeException("Invalid amount");
    }

    boolean isVerified = false;

    BankAccount bankAccount = (BankAccount) bankAccountDAO_.find(bankAccountId);

    if (bankAccount.getVerified() || bankAccount.getRandomDepositAmount() == randomDepositAmount) {
      isVerified = true;
    }

    pm.log(getX());

    return isVerified;
  }

  @Override
  public void start() {
    bankAccountDAO_ = (DAO) getX().get("bankAccountDAO");
  }
}
