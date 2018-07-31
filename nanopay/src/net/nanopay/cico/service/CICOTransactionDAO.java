package net.nanopay.cico.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.mlang.MLang;
import java.util.Date;
import java.util.List;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;

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

    if ( transaction.getType() != TransactionType.CASHOUT && transaction.getType() != TransactionType.CASHIN && transaction.getType() != TransactionType.VERIFICATION ) {
      return super.put_(x, obj);
    }

    if ( transaction.getPaymentAccountInfo() != null ) {
      return getDelegate().put_(x, obj);
    }

    try {
      if ( getDelegate().find_(x, transaction) == null ) transaction.setStatus(TransactionStatus.PENDING);
      // Change later to check whether payeeId or payerId are ACTIVE brokers to set CASHIN OR CASHOUT...
      if ( transaction.getType() == null ) {
        transaction.setType(TransactionType.CASHOUT);
      }
      return getDelegate().put_(x, transaction);
    }
    catch (RuntimeException e) {
      throw e;
    }
  }
}
