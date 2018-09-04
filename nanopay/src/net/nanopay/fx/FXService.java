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

  public ExchangeRateQuote getFXRate(String sourceCurrency, String targetCurrency, double sourceAmount, String direction, String valueDate) throws RuntimeException {
    ExchangeRateQuote quote = this.fxServiceProvider.getFXRate(sourceCurrency, targetCurrency, sourceAmount, direction, valueDate);
    if ( null != quote ) {
      DeliveryTimeFields timeFields = quote.getDeliveryTime();
      Date processTime = null == timeFields ? new Date() : timeFields.getProcessDate();
      FXQuote fxQuote = (FXQuote) fxQuoteDAO_.put(new FXQuote.Builder(getX())
          .setExpiryTime(null)
          .setQuoteDateTime(processTime)
          .setExternalId(quote.getId())
          .setSourceCurrency(sourceCurrency)
          .setTargetCurrency(targetCurrency)
          .setStatus(ExchangeRateStatus.QUOTED.getName())
          .build());
      quote.setId(String.valueOf(fxQuote.getId()));
    }

    return quote;
  }

  public FXAccepted acceptFXRate(FXQuote request) throws RuntimeException {
    FXAccepted fxAccepted = this.fxServiceProvider.acceptFXRate(request);
    if ( null != fxAccepted ) {
      request.setStatus(ExchangeRateStatus.ACCEPTED.getName());

      fxQuoteDAO_.put_(getX(), request);

    }
    return fxAccepted;
  }

  public void start() {
    fxQuoteDAO_ = (DAO) getX().get("fxQuoteDAO");
  }

}
