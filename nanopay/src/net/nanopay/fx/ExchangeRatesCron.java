package net.nanopay.fx;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.mlang.MLang;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.GT;
import foam.mlang.sink.Count;
import foam.nanos.pm.PM;
import foam.nanos.logger.Logger;
import net.nanopay.fx.ExchangeRate;
import net.nanopay.fx.FixerIOExchangeRate;
import net.nanopay.fx.FXProvider;
import net.nanopay.exchangeable.Currency;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import org.apache.commons.io.IOUtils;


/**
 * Every day this cronjob fetches exchange rates and updates exchangeRateDAO
 *
 */
public class ExchangeRatesCron
    implements ContextAgent {

  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {

    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  protected DAO exchangeRateDAO_;
  protected DAO currencyDAO_;
  protected Logger logger_;

  @Override
  public void execute(X x) {
    exchangeRateDAO_ = (DAO) x.get("exchangeRateDAO");
    currencyDAO_      = (DAO) x.get("currencyDAO");
    logger_            = (Logger) x.get("logger");
    PM pmFetch        = new PM(this.getClass(), "fetchRates");

    List currencies = ((ArraySink) currencyDAO_.select(new ArraySink())).getArray();
    for ( Object currency : currencies ) {
      fetchRates(x, (Currency) currency);
    }
    pmFetch.log(x);
  }

  protected void fetchRates(X x, Currency currency) {
    Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
    Count count = (Count) exchangeRateDAO_
      .where(
             AND(
                 EQ(ExchangeRate.FROM_CURRENCY, currency.getAlphabeticCode()),
                 GT(ExchangeRate.EXPIRATION_DATE, calendar.getTime())
                 )
             )
      .select(new Count());

    if (count.getValue() == 0) {
      HttpURLConnection conn = null;
      BufferedReader reader = null;

      try {
        URL url = new URL("https://api.exchangeratesapi.io/latest?base="+currency.getAlphabeticCode());
        conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5 * 1000);
        conn.setReadTimeout(5 * 1000);
        conn.setDoInput(true);
        conn.setRequestProperty("Accept-Charset", "UTF-8");

        StringBuilder builder = sb.get();
        reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        for ( String line; (line = reader.readLine()) != null; ) {
          builder.append(line);
        }

        JSONParser parser = x.create(JSONParser.class);
        FixerIOExchangeRate response = (FixerIOExchangeRate) parser
            .parseString(builder.toString(), FixerIOExchangeRate.class);

        // add one day to expiration date since api fetches rates every day
        calendar.add(Calendar.DATE, 1);

        Map rates = response.getRates();
        logger_.debug(this.getClass().getSimpleName(), "fetchRates", "fetched", rates.size());
        for ( Object key : rates.keySet() ) {
          final ExchangeRate exchangeRate = new ExchangeRate();
          String targetCurrency = (String) key;
          String sourceCurrency = response.getBase();
          FXProvider fxProvider = new FXProvider.Builder(x).build();

          exchangeRate.setFromCurrency(sourceCurrency);
          exchangeRate.setToCurrency(targetCurrency);
          exchangeRate.setRate((Double) rates.get(key));
          exchangeRate.setExpirationDate(calendar.getTime());
          exchangeRate.setValueDate(new Date());
          exchangeRate.setFxProvider(fxProvider.getId());
          exchangeRateDAO_.put(exchangeRate);

        }
      } catch (Throwable t) {
        logger_.warning(this.getClass().getSimpleName(), "fetchRates", currency, "Failed:", t.getMessage(), t);
      } finally  {
        IOUtils.closeQuietly(reader);
        if (conn != null) {
          conn.disconnect();
        }
      }
    }
  }
}
