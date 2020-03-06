package net.nanopay.tx.planner;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.nanos.auth.LifecycleState;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;

public class TransactionQuotingValidator implements Validator {

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

    if (quote.getSourceAccount().getLifecycleState() == LifecycleState.DELETED )
     throw new RuntimeException("Unable to send from deleted account");
    if (quote.getDestinationAccount().getLifecycleState() == LifecycleState.DELETED )
      throw new RuntimeException("Unable to send to account "+quote.getDestinationAccount().getId());

    if( quote.getDestinationAccount() instanceof net.nanopay.account.AggregateAccount )
      throw new RuntimeException("Unable to send funds to an aggregate account");
    if( quote.getSourceAccount() instanceof net.nanopay.account.AggregateAccount )
      throw new RuntimeException("Unable to send funds from an aggregate account");

    if( quote.getDestinationAccount() instanceof net.nanopay.account.SecuritiesAccount && ! ( quote.getSourceAccount() instanceof net.nanopay.account.SecuritiesAccount ) )
      throw new RuntimeException("Unable to send between Securities and Cash");
    if( quote.getSourceAccount() instanceof net.nanopay.account.SecuritiesAccount && ! ( quote.getDestinationAccount() instanceof net.nanopay.account.SecuritiesAccount ) )
      throw new RuntimeException("Unable to send between Cash and Securities");
  }
}
