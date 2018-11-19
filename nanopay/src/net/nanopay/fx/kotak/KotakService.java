package net.nanopay.fx.kotak;

import foam.core.ContextAwareSupport;
import foam.core.X;
import net.nanopay.fx.kotak.model.AcknowledgementType;
import net.nanopay.fx.kotak.model.InitiateRequest;
import net.nanopay.fx.kotak.model.Reversal;

public class KotakService
  extends ContextAwareSupport
  implements Kotak
{
  public KotakService(X x) {
    setX(x);
  }

  @Override
  public AcknowledgementType initiatePayment(InitiateRequest request) {
    throw new UnsupportedOperationException("Unimplemented method: initiatePayment");
  }

  @Override
  public Reversal initiateReversal(Reversal request) {
    throw new UnsupportedOperationException("Unimplemented method: initiateReversal");
  }
}
