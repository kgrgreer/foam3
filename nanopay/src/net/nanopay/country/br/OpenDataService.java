/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */
package net.nanopay.country.br;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.auth.Address;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.om.OMLogger;
import foam.util.SafetyUtil;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.time.DayOfWeek;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import net.nanopay.bank.BankHolidayService;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.Header;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.NoConnectionReuseStrategy;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;


public class OpenDataService extends ContextAwareSupport implements OpenData {

  private CloseableHttpClient httpClient;
  private JSONParser jsonParser;
  private Logger logger;
  private OMLogger omLogger;
  private static String OPEN_DATA_URL = "https://olinda.bcb.gov.br/olinda/service/PTAX/version/v1/odata/";

  public OpenDataService(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
    logger = new PrefixLogger(new Object[]{this.getClass().getSimpleName()}, logger);
    omLogger = (OMLogger) x.get("OMLogger");
    jsonParser = new JSONParser();
    jsonParser.setX(x);
  }

  protected CloseableHttpClient getHttpClient() {
    if ( httpClient == null ) {
      RequestConfig requestConfig = RequestConfig.custom().setConnectionRequestTimeout(5000).build();
      httpClient = HttpClientBuilder.create().setDefaultRequestConfig(requestConfig)
        .setConnectionReuseStrategy(new NoConnectionReuseStrategy()).build(); // Untill we figure out how to handle stale connections
    }
    return httpClient;
  }

  protected CloseableHttpResponse sendGet(String endpoint, Map<String, String> params) {
    try {
      URIBuilder uriBuilder = new URIBuilder(endpoint);
      for ( Map.Entry<String, String> entry : params.entrySet() ) {
        uriBuilder.setParameter(entry.getKey(), entry.getValue());
      }
      HttpGet httpGet = new HttpGet(uriBuilder.build());
      logRequestMessage(endpoint, httpGet.getURI().toString());
      omLogger.log("bcb.opendata.gov Request to " + endpoint + " Starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);
      omLogger.log("bcb.opendata.gov Request to " + endpoint + " Completed");
      return httpResponse;
    } catch (IOException io) {
      logger.error(io);
      omLogger.log("bcb.opendata.gov Request to " + endpoint + " failed");
      throw new RuntimeException("Error sending request to bcb.opendata.gov " + io.getMessage());
    } catch (URISyntaxException e) {
      logger.error(e);
      throw new RuntimeException("URI syntax error while sending request to " + endpoint + e.getMessage());
    }
  }

  protected String parseHttpResponse(CloseableHttpResponse httpResponse, String endpoint) {
    if ( httpResponse == null ) throw new RuntimeException("No response got from bcb.opendata endpoint: " + endpoint);
    try {
      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        String errorMsg = parseHttpResponseError(endpoint, httpResponse);
        logger.error(errorMsg);
        throw new RuntimeException(errorMsg);
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);
      logResponseMessage(endpoint, response);
      return response;
    } catch (IOException io) {
      logger.error(io);
      throw new RuntimeException("Unable to parse http response from endpoint: " + endpoint  + io.getMessage());
    } finally {
      try {
        httpResponse.close();
      } catch (IOException io) {
        logger.error(io);
      }
    }
  }

  protected String parseHttpResponseError(String endpoint, CloseableHttpResponse httpResponse) {
    if ( httpResponse == null  ) return "";
    StringBuilder sb = new StringBuilder();
    sb.append("bcb.opendata.gov ");
    sb.append(endpoint);
    sb.append(" failed with: ");
    sb.append(httpResponse.getStatusLine().getStatusCode());
    sb.append(" - ");
    sb.append(httpResponse.getStatusLine().getReasonPhrase());
    try {
      sb.append(EntityUtils.toString(httpResponse.getEntity(), "UTF-8"));
    } catch (Exception e) {

    }
    EntityUtils.consumeQuietly(httpResponse.getEntity());
    return sb.toString();
  }

  protected void logRequestMessage(String methodName, String msg) {
    logMessage(methodName, msg, "Request");
  }

  protected void logResponseMessage(String methodName, String msg) {
    logMessage(methodName, msg, "Response");
  }

  private void logMessage(String endpoint, String msg, String msgType) {
    StringBuilder sb = new StringBuilder();
    sb.append("endpoint: ");
    sb.append(endpoint);
    sb.append(", " + msgType +" : ");
    sb.append(msg);
    logger.debug(sb.toString());
  }

  public PTaxDollarRateResponse getLatestPTaxRates(int days) {
    try {
      String endpoint = OPEN_DATA_URL + "DollarRateDate(dataCotacao=@dataCotacao)";
      String latestDate = previousDaySkipHolidayAndWeekends(days).format(DateTimeFormatter.ofPattern("MM-dd-yyyy"));
      Map<String, String> params = Map.of(
        "@dataCotacao", "'" + latestDate + "'",
        "$format", "json"
      );
      CloseableHttpResponse httpResponse = sendGet(endpoint, params);
      return (PTaxDollarRateResponse) jsonParser.parseString(parseHttpResponse(httpResponse, endpoint), PTaxDollarRateResponse.class);
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }

  public LocalDate previousDaySkipHolidayAndWeekends(int days) {
    BankHolidayService bankHolidayService = (BankHolidayService) getX().get("bankHolidayService");
    Address address = new Address.Builder(getX()).setCountryId("BR").setRegionId("").build();
    Instant yesterday = Instant.now().minus(days, ChronoUnit.DAYS);
    Date result = bankHolidayService.skipBankHolidaysBackwards(getX(), Date.from(yesterday), address, 0);
    return result.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
  }

  public PTaxRate getPTaxRate() throws RuntimeException {
    try {
      // Try with yesterday date first
      PTaxDollarRateResponse response = getLatestPTaxRates(1);
      if ( response == null )
        throw new RuntimeException("Unable to get a valid response from PTax open API");

      if ( response.getValue() != null && response.getValue().length > 0 ) return response.getValue()[0];

      // Invalid response was obtained, so try with todays date
      response = getLatestPTaxRates(0);
      if ( response == null )
        throw new RuntimeException("Unable to get a valid response from PTax open API");

      if ( response.getValue() != null && response.getValue().length > 0 ) return response.getValue()[0];

      return null;
    } catch(Throwable t) {
      logger.error("Error getting PTax" , t);
      throw new RuntimeException(t);
    }
  }
}
