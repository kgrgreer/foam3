package net.nanopay.interac;

import foam.dao.DAO;
import net.nanopay.interac.service.InteracService;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionService;
import foam.core.ContextAwareSupport;

import java.util.Random;
import java.util.UUID;

public class InteracTransactionService
  extends ContextAwareSupport
  implements InteracService
{
  protected TransactionService service;
  protected DAO canadianTransactionDAO;
  protected DAO indiaTransactionDAO;

  @Override
  public void start() {
    service = (TransactionService) getX().get("transaction");
  }

  @Override
  public Transaction transferValue(Transaction transaction) throws java.lang.RuntimeException {
    if ( transaction instanceof Transaction ) {
      if ( transaction.getPayerId() <= 0 ) {
        throw new RuntimeException("Invalid Payer id");
      }

      if ( transaction.getPayeeId() <= 0 ) {
        throw new RuntimeException("Invalid Payee id");
      }

      if ( transaction.getAmount() < 0 ) {
        throw new RuntimeException("Invalid amount");
      }

      if ( transaction.getRate() <= 0 ) {
        throw new RuntimeException("Invalid rate");
      }

      if ( transaction.getPurpose() == null ) {
        throw new RuntimeException("Invalid purpose");
      }

      if ( transaction.getFees() < 0 ) {
        throw new RuntimeException("Invalid fees");
      }

      String referenceNumber = "CAxxx" + UUID.randomUUID().toString().substring(0, 3).toUpperCase();

      Random random = new Random();
      char[] digits = new char[13];
      digits[0] = (char) (random.nextInt(9) + '1');
      for ( int i = 1; i < 13; i++ ) {
        digits[i] = (char) (random.nextInt(10) + '0');
      }

      transaction.setReferenceNumber(referenceNumber);
      transaction.setImpsReferenceNumber(Long.parseLong(new String(digits)));
    }

    return transaction;
  }
}