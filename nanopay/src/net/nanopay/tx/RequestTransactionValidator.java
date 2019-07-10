package net.nanopay.tx;


import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.tx.model.Transaction;


public class RequestTransactionValidator implements Validator {

  @Override
  public void validate(X x, FObject obj) {

    if ( ! (obj instanceof TransactionQuote) ) {
      throw new RuntimeException("you can only put instanceof TransactionQuote to localTransactionQuotePlanDAO");
    }

    TransactionQuote quote = (TransactionQuote) obj;

    if ( quote.getDestinationAccount() == null ) {
      throw new RuntimeException("destinationAccount must be set");
    }

    if ( quote.getSourceAccount() == null ) {
      throw new RuntimeException("sourceAccount must be set");
    }

  }
}
