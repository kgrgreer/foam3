package net.nanopay.exchangerate;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.dao.*;
import foam.mlang.MLang;
import net.nanopay.exchangerate.model.Rate;

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
  public DAO getRate(String from, String to, Long amount)
    throws RuntimeException
  {
    // Rate rate = exchangeRateDAO_.where(
    //   MLang.AND(
    //     MLang.EQ(Rate.FROM, from),
    //     MLang.EQ(Rate.TO, to)
    //   )
    // );

    URLConnection connection = new URL("http://api.fixer.io/latest?base=" + from).openStream();
    connection.setRequestProperty("Accept-Charset", "UTF-8");
    InputStream response = connection.getInputStream();

    JSONParser jsonParser = new JSONParser();

    JSONObject parsedResponse = (JSONObject)jsonParser.parse(
      new InputStreamReader(response, "UTF-8")
    );

    JSONObject result = new JSONObject();

    String rate = parsedResponse.getJSONObject("rates").getString(to);

    result.put("rate", rate);

    JSONObject input = new JSONObject();
    input.put("from", from);
    input.put("to", to);
    input.put("amount", amount);
    result.put("input", input);


    return result;
  }

  @Override
  public void start() {
    ExchangeRateDAO exchangeRateDAO = new ExchangeRateDAO();
    exchangeRateDAO.setOf(ExchangeRate.getOwnClassInfo());
    exchangeRateDAO.setX(this.getX());

    try {
      rateDAO_ = new MapDAO(exchangeRateDAO, "exchangeRates");
    } catch (IOException e) {
      e.printStackTrace();
    }

    this.getX().put("ExchangeRateDAO", exchangeRateDAO_);
  }
}
