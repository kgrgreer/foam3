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
import net.nanopay.fx.interac.model.AcceptRateApiModel;
import net.nanopay.fx.interac.model.AcceptExchangeRateFields;
import net.nanopay.fx.model.ExchangeRateQuote;
import net.nanopay.fx.model.ExchangeRateFields;
import net.nanopay.fx.model.FeesFields;
import net.nanopay.fx.model.DeliveryTimeFields;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import java.text.SimpleDateFormat;

public class ExchangeRateService
  extends    ContextAwareSupport
  implements ExchangeRateInterface
{
  protected DAO    exchangeRateDAO_;
  protected Double feeAmount = new Double(1);

  @Override
  public ExchangeRateQuote getRateFromSource(String sourceCurrency, String targetCurrency, double sourceAmount, String valueDate)
      throws RuntimeException
  {
    PM pm = new PM(this.getClass(), "getRateFromSource");

    if ( sourceCurrency == null || sourceCurrency.equals("") ) {
      throw new RuntimeException("Invalid sourceCurrency");
    }

    if ( targetCurrency == null || targetCurrency.equals("") ) {
      throw new RuntimeException("Invalid targetCurrency");
    }

    if ( sourceAmount < 0 ) {
      throw new RuntimeException("Invalid sourceAmount");
    }

    //final double amount = ((double) amountI) / 100.0;
    final ExchangeRateQuote  quote       = new ExchangeRateQuote();
    final ExchangeRateFields reqExRate   = new ExchangeRateFields();
    final FeesFields         reqFee      = new FeesFields();
    final DeliveryTimeFields reqDlvrTime = new DeliveryTimeFields();

    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        quote.setCode(((ExchangeRate) obj).getCode());
        quote.setExchangeRate(reqExRate);
        quote.setFee(reqFee);
        quote.setDeliveryTime(reqDlvrTime);

        if ( valueDate == null || valueDate.equals("") ) {
          reqExRate.setValueDate((Date) new Date());
        } else {
            //reqExRate.setValueDate(valueDate);
          try {
            String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat format = new SimpleDateFormat(pattern);
            Date date = format.parse(valueDate);
            reqExRate.setValueDate(date);
          } catch ( Throwable t ) {
              //TODO
          }
        }

        reqExRate.setSourceCurrency(sourceCurrency);
        reqExRate.setTargetCurrency(targetCurrency);
        reqExRate.setDealReferenceNumber(((ExchangeRate) obj).getDealReferenceNumber());
        reqExRate.setFxStatus(((ExchangeRate) obj).getFxStatus());
        reqExRate.setRate(((ExchangeRate) obj).getRate());
        reqExRate.setTargetAmount((sourceAmount - feeAmount) * reqExRate.getRate());
        reqExRate.setSourceAmount(sourceAmount);
        reqFee.setTotalFees(feeAmount);
        reqFee.setTotalFeesCurrency(sourceCurrency);
        reqExRate.setExpirationTime(new Date(new Date().getTime() + (1000 * 60 * 60 * 2)));
        reqDlvrTime.setProcessDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));
      }
    });

    if ( quote.getCode() == null || (quote.getCode()).equals("") ) {
      quote.setCode("400");
    }

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

  @Override
  public ExchangeRateQuote getRateFromTarget(String sourceCurrency, String targetCurrency, double targetAmount, String valueDate)
      throws RuntimeException
  {
    PM pm = new PM(this.getClass(), "getRateFromSource");

    if ( sourceCurrency == null || sourceCurrency.equals("") ) {
      throw new RuntimeException("Invalid sourceCurrency");
    }

    if ( targetCurrency == null || targetCurrency.equals("") ) {
      throw new RuntimeException("Invalid targetCurrency");
    }

    if ( targetAmount < 0 ) {
      throw new RuntimeException("Invalid targetAmount");
    }

    //final double amount = ((double) amountI) / 100.0;
    final ExchangeRateQuote  quote       = new ExchangeRateQuote();
    final ExchangeRateFields reqExRate   = new ExchangeRateFields();
    final FeesFields         reqFee      = new FeesFields();
    final DeliveryTimeFields reqDlvrTime = new DeliveryTimeFields();

    exchangeRateDAO_.where(
        MLang.AND(
            MLang.EQ(ExchangeRate.FROM_CURRENCY, sourceCurrency),
            MLang.EQ(ExchangeRate.TO_CURRENCY, targetCurrency)
        )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        reqExRate.setRate(((ExchangeRate) obj).getRate());
        quote.setExchangeRate(reqExRate);
        quote.setFee(reqFee);
        quote.setDeliveryTime(reqDlvrTime);
        reqExRate.setSourceCurrency(sourceCurrency);
        reqExRate.setTargetCurrency(targetCurrency);

        if ( valueDate == null || valueDate.equals("") ) {
          reqExRate.setValueDate((Date) new Date());
        } else {
          try {
            String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat format = new SimpleDateFormat(pattern);
            Date date = format.parse(valueDate);
            reqExRate.setValueDate(date);
          } catch ( Throwable t ) {
            //TODO
          }
        }

        reqExRate.setDealReferenceNumber(((ExchangeRate) obj).getDealReferenceNumber());
        reqExRate.setFxStatus(((ExchangeRate) obj).getFxStatus());
        quote.setCode(((ExchangeRate) obj).getCode());

        reqExRate.setSourceAmount((targetAmount / reqExRate.getRate()) + feeAmount);
        reqExRate.setTargetAmount(targetAmount);
        reqFee.setTotalFees(feeAmount);
        reqFee.setTotalFeesCurrency(sourceCurrency);
        reqExRate.setExpirationTime(new Date(new Date().getTime() + (1000 * 60 * 60 * 2)));
        reqDlvrTime.setProcessDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));

      }
    });

    if ( quote.getCode() == null || (quote.getCode()).equals("") ) {
      quote.setCode("400");
    }

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

  @Override
  public AcceptRateApiModel acceptRate(String endToEndId, String dealRefNum)
      throws RuntimeException
  {
    if ( dealRefNum == null || dealRefNum.equals("")  ) {
      throw new RuntimeException("Invalid dealRefNum");
    }

    final AcceptRateApiModel acceptRate  = new AcceptRateApiModel();
    final AcceptExchangeRateFields acceptField = new AcceptExchangeRateFields();

    acceptRate.setCode("200");
    acceptRate.setEndToEndId(endToEndId);
    //String transactionId = java.util.UUID.randomUUID().toString().replace("-", "");
    //acceptRate.setTransactionId(transactionId);
    acceptField.setDealReferenceNumber(dealRefNum);
    acceptField.setFxStatus("Booked");
    acceptRate.setExchangeRate(acceptField);

    return acceptRate;
  }
}
