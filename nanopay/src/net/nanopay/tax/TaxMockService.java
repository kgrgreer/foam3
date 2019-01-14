package net.nanopay.tax;

import foam.core.*;
import net.nanopay.fx.ascendantfx.model.*;

import java.util.*;

public class TaxMockService
    extends ContextAwareSupport
    implements TaxService
{


  @Override
  public TaxQuote getTaxQuote(TaxQuoteRequest request) {
    TaxQuote result = new TaxQuote();

    return result;
  }

}
