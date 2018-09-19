package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;

public class FXService
    extends ContextAwareSupport
    implements FXServiceInterface, NanoService {

  private final FXServiceProvider fxServiceProvider;
  protected DAO fxQuoteDAO_;

  public FXService(final FXServiceProvider fxServiceProvider) {
    this.fxServiceProvider = fxServiceProvider;
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency,
      double sourceAmount, String direction, String valueDate, long user) throws RuntimeException {
    FXQuote fxQuote = this.fxServiceProvider.getFXRate(sourceCurrency, targetCurrency, sourceAmount, direction, valueDate, user);
    if ( null != fxQuote ) {
       fxQuote = (FXQuote) fxQuoteDAO_.put_(getX(), fxQuote);
    }

    return fxQuote;
  }

  public Boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(quoteId));
    if  ( null != quote ) {
      Boolean accepted = this.fxServiceProvider.acceptFXRate(quote.getExternalId(), user);
      if ( accepted ) {
        quote.setStatus(ExchangeRateStatus.ACCEPTED.getName());
        return true;
      }
    }

    return false;
  }

  public void start() {
    fxQuoteDAO_ = (DAO) getX().get("fxQuoteDAO");
  }

}
