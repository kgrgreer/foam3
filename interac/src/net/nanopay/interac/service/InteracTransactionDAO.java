package net.nanopay.interac.service;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import java.util.Random;
import java.util.UUID;
import net.nanopay.tx.model.Transaction;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class InteracTransactionDAO
  extends ProxyDAO
{
  public InteracTransactionDAO(X x) {
    this.setX(x);
    this.setOf(net.nanopay.tx.model.Transaction.getOwnClassInfo());
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    DAO transactionDAO          = (DAO) getX().get("localTransactionDAO");
    DAO canadianTransactionDAO  = (DAO) getX().get("canadaTransactionDAO");
    DAO indiaTransactionDAO     = (DAO) getX().get("indiaTransactionDAO");
    Logger logger = (Logger) x.get("logger");

    Transaction transaction = (Transaction) obj;
    if ( transaction.findSourceAccount(x) == null ) {
      logger.error("Source account not found for transaction " + transaction.getId());
      throw new RuntimeException("Invalid Source/Payer Account");
    }

    if ( transaction.findDestinationAccount(x) == null ) {
      logger.error("Destination account not found for transaction " + transaction.getId());
      throw new RuntimeException("Invalid Destination/Payee Account");
    }

    if ( transaction.getAmount() < 0 ) {
      logger.error("Invalid transaction amount for transaction " + transaction.getId());
      throw new RuntimeException("Invalid amount");
    }

    // if ( transaction.getRate() <= 0 ) {
    //   throw new RuntimeException("Invalid rate");
    // }

    // REVIEW: Commented out for TransactionSubClassRefactor
    // if ( transaction.getPurpose() == null ) {
    //   throw new RuntimeException("Invalid purpose");
    // }

    try {
      Transaction completedTransaction = (Transaction) transactionDAO.put(transaction);

      /**
       * Generate 3 random digits to append to CAXxxx, this will be the
       * Canadian reference number for the demo
       * */
      String referenceNumber = "CAxxx" + UUID.randomUUID().toString().substring(0, 3).toUpperCase();
      completedTransaction.setReferenceNumber(referenceNumber);
      canadianTransactionDAO.put(completedTransaction);

      /**
       * Generate 13 digit random number for IMPS reference number
       * */
      Random random = new Random();
      char[] digits = new char[13];
      digits[0] = (char) (random.nextInt(9) + '1');
      for ( int i = 1; i < 13; i++ ) {
        digits[i] = (char) (random.nextInt(10) + '0');
      }

      completedTransaction.setReferenceNumber(new String(digits));
      indiaTransactionDAO.put(completedTransaction);

      return completedTransaction;

    } catch (RuntimeException e) {
      logger.error("Unexpected exception in InteracTransactionDAO",e);
      throw e;
    }
  }

  // Overrides all functions to only allow put calls
  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported operation: select_");
  }

  @Override
  public FObject find_(X x, Object id) {
    throw new UnsupportedOperationException("Unsupported operation: find_");
  }

  @Override
  public FObject remove_(X x, FObject obj)
  {
    throw new UnsupportedOperationException("Unsupported operation: remove_");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate)
  {
    throw new UnsupportedOperationException("Unsupported operation: removeAll_");
  }
}
