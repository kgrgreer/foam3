package net.nanopay.exchangerate;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.*;
import foam.mlang.MLang;
import net.nanopay.exchangerate.model.ExchangeRate;
import net.nanopay.exchangerate.model.ExchangeRateQuote;

import java.net.*;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class ExchangeRateService
  extends ContextAwareSupport
  implements ExchangeRateInterface
{
  protected DAO exchangeRateDAO_;
  protected Integer feeAmount = 150;

  @Override
  public ExchangeRateQuote getRate(String from, String to, Long amount)
    throws RuntimeException
  {
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
        quote.setFeesAmount(feeAmount);
        quote.setFeesPercentage(feeAmount / amount);
      }
    });

    return quote;
  }

  public void fetchRates()
      throws RuntimeException
  {
    // URLConnection connection = new URL("http://api.fixer.io/latest?base=CAD").openStream();
    // connection.setRequestProperty("Accept-Charset", "UTF-8");
    // InputStream response = connection.getInputStream();

    // JSONParser jsonParser = new JSONParser();

    // JSONObject parsedResponse = (JSONObject)jsonParser.parse(
    //   new InputStreamReader(response, "UTF-8")
    // );

    // System.out.println(parsedResponse.toString());
  }

  @Override
  public void start() {
    exchangeRateDAO_ = (DAO) getX().get("exchangeRateDAO");
  }
}
