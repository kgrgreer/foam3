package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.NanoService;
import java.util.Date;

public class FXService
    extends ContextAwareSupport
    implements FXServiceInterface, NanoService {

  private final FXServiceProvider fxServiceProvider;
  protected DAO fxQuoteDAO_;

  public FXService(final FXServiceProvider fxServiceProvider) {
    this.fxServiceProvider = fxServiceProvider;
  }

  public ExchangeRateQuote getFXRate(String sourceCurrency, String targetCurrency,
      double sourceAmount, String direction, String valueDate, long user) throws RuntimeException {
    ExchangeRateQuote quote = this.fxServiceProvider.getFXRate(sourceCurrency, targetCurrency, sourceAmount, direction, valueDate, user);
    if ( null != quote ) {
      DeliveryTimeFields timeFields = quote.getDeliveryTime();
      Date processTime = null == timeFields ? new Date() : timeFields.getProcessDate();
      FXQuote fxQuote = (FXQuote) fxQuoteDAO_.put(new FXQuote.Builder(getX())
          .setExpiryTime(null)
          .setUser(user)
          .setQuoteDateTime(processTime)
          .setExternalId(quote.getId())
          .setSourceCurrency(sourceCurrency)
          .setTargetCurrency(targetCurrency)
          .setStatus(ExchangeRateStatus.QUOTED.getName())
          .setRate(quote.getExchangeRate().getRate())
          .setFee(quote.getFee().getTotalFees())
          .setFeeCurrency(quote.getFee().getTotalFeesCurrency())
          .build());
      quote.setId(String.valueOf(fxQuote.getId()));
    }

    return quote;
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
