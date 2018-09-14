package net.nanopay.fx.localfx;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import java.util.Date;
import net.nanopay.fx.DeliveryTimeFields;
import net.nanopay.fx.ExchangeRate;
import net.nanopay.fx.ExchangeRateFields;
import net.nanopay.fx.ExchangeRateQuote;
import net.nanopay.fx.FXServiceProvider;
import net.nanopay.fx.FeesFields;

public class LocalFXService extends ContextAwareSupport implements FXServiceProvider {

  protected DAO exchangeRateDAO_;
  protected Double feeAmount = 1d;

  public LocalFXService(X x) {
    exchangeRateDAO_ = (DAO) x.get("exchangeRateDAO");
  }

  public ExchangeRateQuote getFXRate(String sourceCurrency, String targetCurrency,
      double sourceAmount, String fxDirection, String valueDate, long user) throws RuntimeException {

    final ExchangeRateQuote quote = new ExchangeRateQuote();
    final ExchangeRateFields reqExRate = new ExchangeRateFields();
    final FeesFields reqFee = new FeesFields();
    final DeliveryTimeFields reqDlvrTime = new DeliveryTimeFields();

    // Fetch rates from exchangeRateDAO_
    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        quote.setCode(((ExchangeRate) obj).getCode());
        quote.setDeliveryTime(reqDlvrTime);

        reqExRate.setSourceCurrency(((ExchangeRate) obj).getFromCurrency());
        reqExRate.setTargetCurrency(((ExchangeRate) obj).getToCurrency());
        reqExRate.setDealReferenceNumber(((ExchangeRate) obj).getDealReferenceNumber());
        reqExRate.setFxStatus(((ExchangeRate) obj).getFxStatus().getLabel());
        reqExRate.setRate(((ExchangeRate) obj).getRate());
        reqExRate.setExpirationTime(((ExchangeRate) obj).getExpirationDate());
      }
    });

    reqExRate.setTargetAmount((sourceAmount - feeAmount) * reqExRate.getRate());
    reqExRate.setSourceAmount(sourceAmount);
    reqFee.setTotalFees(feeAmount);
    reqFee.setTotalFeesCurrency(sourceCurrency);
    reqDlvrTime.setProcessDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));

    quote.setFee(reqFee);
    quote.setExchangeRate(reqExRate);

    return quote;

  }

  public Boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    return true;
  }
}
