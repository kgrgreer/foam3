package net.nanopay.exchangerate;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.dao.*;
import foam.mlang.MLang.*;
import net.nanopay.exchangerate.model.ExchangeRate;
import net.nanopay.exchangerate.model.ExchangeRateQuote;

import java.io.IOException;
import java.io.InputStreamReader;
import org.json.simple.JSONParser;
import org.json.simple.JSONObject;

public class ExchangeRateService
  extends ContextAwareSupport
  implements ExchangeRate
{
  protected DAO exchangeRateDAO_;

  @Override
  public ExchangeRateQuote getRate(String from, String to, Long amount)
    throws RuntimeException
  {
    ArraySink a = (ArraySink) exchangeRateDAO_.where(
      AND(
        EQ(ExchangeRate.FROM, from),
        EQ(ExchangeRate.TO, to)
      )
    ).limit(1).select();


    ExchangeRateQuote quote = new ExchangeRateQuote();

    quote.setExchangeRateId(a.id);
    quote.setFromCurrency(from);
    quote.setToCurrency(to);
    quote.setFromAmount(amount);
    quote.setToAmount(amount * a.rate);
    quote.setRate(a.rate);
    quote.setFeesAmount(1);
    quote.setFeesPercentage(1);
    quote.setExpirationDate(a.expirationDate);

    return quote;
  }

  public void fetchRates()
      throws RuntimeException
  {
    URLConnection connection = new URL("http://api.fixer.io/latest?base=CAD").openStream();
    connection.setRequestProperty("Accept-Charset", "UTF-8");
    InputStream response = connection.getInputStream();

    JSONParser jsonParser = new JSONParser();

    JSONObject parsedResponse = (JSONObject)jsonParser.parse(
      new InputStreamReader(response, "UTF-8")
    );

    System.out.println(parsedResponse.toString());
  }

  @Override
  public void start() {
    exchangeRateDAO_ = (DAO) getX().get("exchangeRateDAO");
  }
}
