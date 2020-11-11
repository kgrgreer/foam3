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
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.om.OMLogger;
import foam.util.SafetyUtil;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.time.DayOfWeek;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
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


public class CNAEClientService extends ContextAwareSupport implements CNAEClient {

  private CloseableHttpClient httpClient;
  private JSONParser jsonParser;
  private Logger logger;
  private OMLogger omLogger;
  private static String CNAE_URL = "https://servicodados.ibge.gov.br/api/v2/cnae/classes";

  public CNAEClientService(X x) {
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
      if ( params != null ) {
        for ( Map.Entry<String, String> entry : params.entrySet() ) {
          uriBuilder.setParameter(entry.getKey(), entry.getValue());
        }
      }
      HttpGet httpGet = new HttpGet(uriBuilder.build());
      logRequestMessage(endpoint, httpGet.getURI().toString());
      omLogger.log("CNAE_Service Request to " + endpoint + " Starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);
      omLogger.log("CNAE_Service Request to " + endpoint + " Completed");
      return httpResponse;
    } catch (IOException io) {
      logger.error(io);
      omLogger.log("CNAE_Service Request to " + endpoint + " failed");
      throw new RuntimeException("Error sending request to CNAE_Service " + io.getMessage());
    } catch (URISyntaxException e) {
      logger.error(e);
      throw new RuntimeException("URI syntax error while sending request to " + endpoint + e.getMessage());
    }
  }

  protected String parseHttpResponse(CloseableHttpResponse httpResponse, String endpoint) {
    if ( httpResponse == null ) throw new RuntimeException("No response got from CNAE_Service endpoint: " + endpoint);
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
    sb.append("CNAE_Service ");
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

  public Object[] fetchAll() {
    try {
      CloseableHttpResponse httpResponse = sendGet(CNAE_URL, null);
      return jsonParser.parseStringForArray(parseHttpResponse(httpResponse, CNAE_URL), CNAE.class);
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }

}
