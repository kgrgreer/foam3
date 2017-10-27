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

    if ( bankAccountId == null || bankAccountId <= 0 ) {
      throw new RuntimeException("Invalid Bank Account Id");
    }

    if ( randomDepositAmount == null || randomDepositAmount <= 0 ) {
      throw new RuntimeException("Invalid amount");
    }

    bool isVerified = false;

    bankAccountDAO_.where(
      MLang.EQ(BankAccount.ID, bankAccountId)
    ).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        if (
          ((BankAccount) obj).getVerified() ||
          ((BankAccount) obj).getRandomDepositAmount() == randomDepositAmount
        ) {
          isVerified = true;
        }
      }
    });

    pm.log(getX());

    return isVerified;
  }

  @Override
  public void start() {
    bankAccountDAO_ = (DAO) getX().get("bankAccountDAO");
  }
}
