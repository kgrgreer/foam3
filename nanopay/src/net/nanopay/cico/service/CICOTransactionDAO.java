package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.cico.model.TransactionStatus;

public class CICOTransactionDAO
  extends ProxyDAO
{
  public CICOTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public CICOTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    Transaction transaction = (Transaction) obj;

    if ( transaction.getBankAccountId() == null ) {
      throw new RuntimeException("Invalid bank account");
    }

    if ( transaction.getPayeeId() == 0 &&  transaction.getPayerId() != 0 ) {
      System.out.println("IF CICOTransactionDAO");
      transaction.setPayeeId(transaction.getPayerId());
    } else if ( transaction.getPayerId() == 0 &&  transaction.getPayeeId() != 0 ) {
      System.out.println("ELSE CICOTransactionDAO");
      transaction.setPayerId(transaction.getPayeeId());
    }

    try {
      if ( transaction.getCicoStatus() == null ) {
        transaction.setCicoStatus(TransactionStatus.NEW);
      }
      // Change later to check whether payeeId or payerId are ACTIVE brokers to set CASHIN OR CASHOUT...
      if ( transaction.getType() == null ) {
        transaction.setType(TransactionType.CASHOUT);
      }

      if ( transaction.getType() == TransactionType.CASHOUT ) {

      } else if ( transaction.getType() == TransactionType.CASHIN ) {

      }
      System.out.println("returning CICO transaction");
      return getDelegate().put_(x, transaction);

    } catch (RuntimeException e) {
      throw e;
    }

  }
}
