package net.nanopay.exchangerate;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.*;
import foam.nanos.pm.PM;
import foam.mlang.MLang;
import net.nanopay.exchangerate.model.ExchangeRate;
import net.nanopay.exchangerate.model.ExchangeRateQuote;

import java.net.*;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Date;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class ExchangeRateService
    extends ContextAwareSupport
    implements ExchangeRateInterface
{
  protected DAO exchangeRateDAO_;
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

    double amount = ((double)amountI) / 100.0;

    ExchangeRateQuote quote = new ExchangeRateQuote();

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
      public void put(FObject obj, Detachable sub) {
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
        fetchRates();
      }
    }.start();

    return quote;
  }

  public void fetchRates()
      throws RuntimeException
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

      for (Object key : rates.keySet()) {
        String currencyCode = (String) key;
        Double rateValue = (Double) rates.get(currencyCode);

        ExchangeRate rate = new ExchangeRate();

        rate.setFromCurrency((String) parsedResponse.get("base"));
        rate.setToCurrency((String) currencyCode);
        rate.setRate((Double) rateValue);
        rate.setExpirationDate((Date) new Date());

        exchangeRateDAO_.put(rate);
      }

      pmFetch.log(getX());
    } catch (IOException | ParseException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void start() {
    exchangeRateDAO_ = (DAO) getX().get("exchangeRateDAO");
    fetchRates();
  }
}
