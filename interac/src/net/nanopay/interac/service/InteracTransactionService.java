package net.nanopay.interac;

import net.nanopay.interac.service.InteracService;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionService;
import foam.core.ContextAwareSupport;

public class InteracTransactionService
  extends ContextAwareSupport
  implements InteracService
{
  protected TransactionService service;

  @Override
  public void start() {
    service = (TransactionService) getX().get("transaction");
  }

  @Override
  public Transaction transferValue(Transaction transaction) throws java.lang.RuntimeException {
    return new Transaction();
  }
}