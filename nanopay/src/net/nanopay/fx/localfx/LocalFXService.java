package net.nanopay.fx.localfx;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import net.nanopay.fx.ExchangeRate;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXServiceProvider;

public class LocalFXService extends ContextAwareSupport implements FXServiceProvider {

  protected DAO exchangeRateDAO_;
  protected Double feeAmount = 1d;

  public LocalFXService(X x) {
    exchangeRateDAO_ = (DAO) x.get("exchangeRateDAO");
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency,
      double sourceAmount, String fxDirection, String valueDate, long user) throws RuntimeException {

    final FXQuote fxQuote = new FXQuote();


    // Fetch rates from exchangeRateDAO_
    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {

        fxQuote.setSourceCurrency(((ExchangeRate) obj).getFromCurrency());
        fxQuote.setTargetCurrency(((ExchangeRate) obj).getToCurrency());
        fxQuote.setExternalId(((ExchangeRate) obj).getDealReferenceNumber());
        fxQuote.setStatus(((ExchangeRate) obj).getFxStatus().getLabel());
        fxQuote.setRate(((ExchangeRate) obj).getRate());
        fxQuote.setExpiryTime(((ExchangeRate) obj).getExpirationDate());
      }
    });

    fxQuote.setTargetAmount((sourceAmount - feeAmount) * fxQuote.getRate());
    fxQuote.setSourceAmount(sourceAmount);
    fxQuote.setFee(feeAmount);
    fxQuote.setFeeCurrency(sourceCurrency);


    return fxQuote;

  }

  public Boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    return true;
  }
}
