package net.nanopay.tx;


import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import net.nanopay.tx.model.Transaction;


public class RequestTransactionValidator implements Validator {

  @Override
  public void validate(X x, FObject obj) {

    Logger logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, (Logger) x.get("logger"));
    if ( ! (obj instanceof TransactionQuote) ) {
      logger.error("Obj is not instance of TransactionQuote", obj );
      throw new RuntimeException("you can only put instanceof TransactionQuote to localTransactionQuotePlanDAO");
    }

    TransactionQuote quote = (TransactionQuote) obj;

    if ( quote.getDestinationAccount() == null ) {
      logger.error("Destination account must be set for quote", quote);
      throw new RuntimeException("destinationAccount must be set");
    }

    if ( quote.getSourceAccount() == null ) {
      logger.error("Source account must be set for quote", quote);
      throw new RuntimeException("sourceAccount must be set");
    }

    Transaction request = quote.getRequestTransaction();
    if ( request != null &&
         ! foam.util.SafetyUtil.isEmpty(request.getId()) ) {
      logger.warning("Clearing Request Transaction ID", request.getId());
      Transaction.ID.clear(request);
    }
  }
}
