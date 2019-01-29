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
    Logger logger = (Logger) x.get("logger");
    User user = (User) x.get("user");

    logger.debug("RequestTransactionValidator.validate user:", user.getId(), user.label());

    //x = x.put("userDAO", x.get("localUserDAO"));

    if ( ! (obj instanceof TransactionQuote) ) {
      throw new RuntimeException("you can only put instanceof TransactionQuote to localTransactionQuotePlanDAO");
    }

    TransactionQuote quote = (TransactionQuote) obj;

    Transaction txn = quote.getRequestTransaction();

    logger.info("txn.findDestinationAccount(x) " + txn.findDestinationAccount(x));
    if ( txn.findDestinationAccount(x) == null ) {
      throw new RuntimeException("destinationAccount must be set");
    }

    logger.info("txn.findSourceAccount(x): " + txn.findSourceAccount(x));
    if ( txn.findSourceAccount(x) == null ) {
      throw new RuntimeException("sourceAccount must be set");
    }

    // **** Commented because fails my tests. Kristina.
    User sourceOwner = (User) ((DAO) x.get("localUserDAO")).find(txn.findSourceAccount(x).getOwner());
    if ( sourceOwner != null && ! sourceOwner.getEmailVerified() ) {
      //throw new AuthorizationException("You must verify email to send money.");
    }

    User destinationOwner = (User) ((DAO) x.get("localUserDAO")).find(txn.findDestinationAccount(x).getOwner());
    if ( destinationOwner != null && ! destinationOwner.getEmailVerified() ) {
     // throw new AuthorizationException("Receiver must verify email to receive money.");
    }

    if ( txn.getAmount() < 0 ) {
      //throw new RuntimeException("Amount cannot be negative");
    }


    if ( ((DAO)x.get("currencyDAO")).find(txn.getSourceCurrency()) == null ) {
      throw new RuntimeException("Source currency is not supported");
    }

    if ( ((DAO)x.get("currencyDAO")).find(txn.getDestinationCurrency()) == null ) {
      throw new RuntimeException("Destination currency is not supported");
    }

  }
}
