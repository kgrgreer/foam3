package net.nanopay.fx;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.pm.PM;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;
import net.nanopay.fx.model.ExchangeRate;
import net.nanopay.fx.model.ExchangeRateQuote;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class ExchangeRateService
  extends    ContextAwareSupport
  implements ExchangeRateInterface
{
  protected DAO    exchangeRateDAO_;
  protected Double feeAmount = new Double(150);

  @Override
  public ExchangeRateQuote getRate(String from, String to, long amountI)
      throws RuntimeException
  {
    PM pm = new PM(this.getClass(), "getRate");

    if ( from == null || from.equals("") ) {
      throw new RuntimeException("Invalid Payer id");
    }

    if ( to == null || to.equals("") ) {
      throw new RuntimeException("Invalid Payee id");
    }

    if ( amountI < 0 ) {
      throw new RuntimeException("Invalid amount");
    }

    final double amount = ((double) amountI) / 100.0;
    final ExchangeRateQuote quote  = new ExchangeRateQuote();

    quote.setFromCurrency(from);
    quote.setToCurrency(to);
    quote.setFromAmount(amount);

    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, from),
            MLang.EQ(ExchangeRate.TO_CURRENCY, to)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        quote.setExchangeRateId(((ExchangeRate) obj).getId());
        quote.setToAmount(amount * ((ExchangeRate) obj).getRate());
        quote.setRate(((ExchangeRate) obj).getRate());
        quote.setExpirationDate(((ExchangeRate) obj).getExpirationDate());
        quote.setFeesAmount((Double) feeAmount);
        quote.setFeesPercentage((Double) feeAmount / amount);
      }
    });

    pm.log(getX());

    // TODO: move to cron job
    new Thread() {
      public void run() {
        // TODO: this should be in a loop with a sleep
        // (or just move to cron)
        fetchRates();
      }
    }.start();

    return quote;
  }

  public void fetchRates()
  {
    PM pmFetch = new PM(this.getClass(), "fetchRates");

    try {
      URLConnection connection = new URL("http://api.fixer.io/latest?base=CAD").openConnection();
      connection.setRequestProperty("Accept-Charset", "UTF-8");
      InputStream response = connection.getInputStream();

      JSONParser jsonParser = new JSONParser();

      JSONObject parsedResponse = (JSONObject) jsonParser.parse(
          new InputStreamReader(response, "UTF-8")
      );

      JSONObject rates = (JSONObject) parsedResponse.get("rates");

      for ( Object key : rates.keySet() ) {
        String       currencyCode = (String) key;
        Double       rateValue    = (Double) rates.get(currencyCode);
        ExchangeRate rate         = new ExchangeRate();

        rate.setFromCurrency((String) parsedResponse.get("base"));
        rate.setToCurrency((String) currencyCode);
        rate.setRate((Double) rateValue);
        rate.setExpirationDate((Date) new Date());

        exchangeRateDAO_.put(rate);
      }

      pmFetch.log(getX());
    } catch (Throwable e) {
      e.printStackTrace();
      // throw new RuntimeException(e);
    }
  }

  @Override
  public void start() {
    exchangeRateDAO_ = (DAO) getX().get("exchangeRateDAO");
    fetchRates();
  }
}
