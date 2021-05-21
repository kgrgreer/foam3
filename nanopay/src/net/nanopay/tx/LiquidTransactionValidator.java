package net.nanopay.tx;


import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.ShadowAccount;
import net.nanopay.tx.model.Transaction;


public class LiquidTransactionValidator implements Validator {

  @Override
  public void validate(X x, FObject obj) {

    Logger logger = (Logger) x.get("logger");

    if ( ! (obj instanceof Transaction) ) {
      logger.error("Obj is not instance of Transaction", obj );
      throw new RuntimeException("invalid object being put to transactionDAO");
    }

    Transaction tx = (Transaction) obj;
    Account dest = tx.findDestinationAccount(x);
    Account source = tx.findSourceAccount(x);

    if (source == null )
      throw new RuntimeException("Unable to send from account");
    if (dest == null )
      throw new RuntimeException("Unable to send from account");

    if (source.getLifecycleState() == LifecycleState.DELETED )
      throw new RuntimeException("Unable to send from deleted account");
    if (dest.getLifecycleState() == LifecycleState.DELETED )
      throw new RuntimeException("Unable to send to account "+dest.getId());

  }
}
