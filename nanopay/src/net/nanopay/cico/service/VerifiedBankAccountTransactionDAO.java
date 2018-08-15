package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;

import static net.nanopay.bank.BankAccountStatus.*;
import static net.nanopay.tx.TransactionType.*;

public class VerifiedBankAccountTransactionDAO
  extends ProxyDAO
{
  public VerifiedBankAccountTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;
    TransactionType type = transaction.getType();

    // if not cash in, cash out, or verification - return
    if ( ! CASHOUT.equals(type) && ! CASHIN.equals(type) && ! VERIFICATION.equals(type) ) {
      return super.put_(x, obj);
    }

    // check if bank account not verified
    if ( ( CASHOUT.equals(type) && UNVERIFIED.equals(((BankAccount) transaction.findDestinationAccount(x)).getStatus()) ) ||
        ( CASHIN.equals(type) && UNVERIFIED.equals(((BankAccount) transaction.findSourceAccount(x)).getStatus()) ) ) {
      throw new RuntimeException("Bank account must be verified");
    }

    return super.put_(x, obj);
  }
}
