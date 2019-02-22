package net.nanopay.fx.localfx;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.util.SafetyUtil;
import net.nanopay.fx.ExchangeRate;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FXProvider;

public class LocalFXService  implements FXService {

  protected DAO exchangeRateDAO_;
  protected DAO fxQuoteDAO_;
  protected Long feeAmount = 1l;
  private final X x;

  public LocalFXService(X x) {
    this.x = x;
    exchangeRateDAO_ = (DAO) x.get("exchangeRateDAO");
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,
    long destinationAmount, String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {

    final FXQuote fxQuote = new FXQuote();
    if ( SafetyUtil.isEmpty(fxProvider)) fxProvider = new FXProvider.Builder(x).build().getId();

    // Fetch rates from exchangeRateDAO_
    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency),
            MLang.EQ(ExchangeRate.FX_PROVIDER, fxProvider)
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

    Double amount = 0.0;

    if ( sourceAmount < 1 ) {
      amount = destinationAmount * fxQuote.getRate();
      sourceAmount = Math.round(amount);
    }

    if ( destinationAmount < 1 ) {
      amount = sourceAmount * fxQuote.getRate();
      destinationAmount = Math.round(amount);
    }

    fxQuote.setTargetAmount(destinationAmount);
    fxQuote.setSourceAmount(sourceAmount);
    fxQuote.setFee(feeAmount);
    fxQuote.setFeeCurrency(sourceCurrency);

    return (FXQuote) fxQuoteDAO_.put_(this.x, fxQuote);

  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(quoteId));
    if  ( null != quote ) {
      quote.setStatus(ExchangeRateStatus.ACCEPTED.getName());
      fxQuoteDAO_.put_(this.x, quote);
      return true;
    }
    return false;
  }
}
