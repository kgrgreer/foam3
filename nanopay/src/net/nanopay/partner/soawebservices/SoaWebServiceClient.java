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
package net.nanopay.partner.soawebservices;

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


public class SoaWebServiceClient extends ContextAwareSupport implements SoaWebService {

  private CloseableHttpClient httpClient;
  private JSONParser jsonParser;
  private Logger logger;
  private OMLogger omLogger;

  public SoaWebServiceClient(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
    logger = new PrefixLogger(new Object[]{this.getClass().getSimpleName()}, logger);
    omLogger = (OMLogger) x.get("OMLogger");
    jsonParser = new JSONParser();
    jsonParser.setX(x);
  }

  @Override
  public PessoaResponse pessoaFisicaNFe(PessoaFisicaNFe request) {
    try {
      SoaCredenciais creds = getCredentials();
      String endpoint = creds.getUrl() + "PessoaFisicaNFe.ashx";
      request.setCredenciais(creds);
      request.setCredenciais(getCredentials());
      CloseableHttpResponse httpResponse = sendPost(endpoint, getJsonMessage(request));
      String responseString = parseHttpResponse(httpResponse, endpoint);
      PessoaResponse response = (PessoaResponse) jsonParser.parseString(responseString, PessoaResponse.class);
      if ( response != null ) response.setResponseString(responseString);
      return response;
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }

  @Override
  public PessoaResponse pessoaJuridicaNFe(PessoaJuridicaNFe request) {
    try {
      SoaCredenciais creds = getCredentials();
      String endpoint = creds.getUrl() + "PessoaJuridicaNFe.ashx";
      request.setCredenciais(creds);
      CloseableHttpResponse httpResponse = sendPost(endpoint, getJsonMessage(request));
      String responseString = parseHttpResponse(httpResponse, endpoint);
      PessoaResponse response = (PessoaResponse) jsonParser.parseString(responseString, PessoaResponse.class);
      if ( response != null ) response.setResponseString(responseString);
      return response;
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }

  protected SoaCredenciais getCredentials() {
    SoaCredenciais credentials = (SoaCredenciais) getX().get("SoaWebServiceCredientials");
    if ( credentials == null ||
         SafetyUtil.isEmpty(credentials.getUrl()) ||
         SafetyUtil.isEmpty(credentials.getEmail()) ||
         SafetyUtil.isEmpty(credentials.getSenha()) ) {
      logger.error(this.getClass().getSimpleName(), "Invalid credentials");
      throw new RuntimeException("Invalid credentials" );
    }
    return credentials;
  }

  protected CloseableHttpClient getHttpClient() {
    if ( httpClient == null ) {
      RequestConfig requestConfig = RequestConfig.custom().setConnectionRequestTimeout(5000).build();
      httpClient = HttpClientBuilder.create().setDefaultRequestConfig(requestConfig)
        .setConnectionReuseStrategy(new NoConnectionReuseStrategy()).build(); // Untill we figure out how to handle stale connections
    }
    return httpClient;
  }

  protected String getJsonMessage(FObject obj) {
    String json = null;

    try(Outputter jsonOutputter = new Outputter(getX()).setOutputShortNames(true).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
      json = jsonOutputter.stringify(obj);
    } catch(Exception e) {
      logger.error(e);
    }
    return json;
  }

  protected HttpPost getHttpPost(String endpoint, String json) {
    logRequestMessage(endpoint, json);
    HttpPost httpPost = new HttpPost(endpoint);

    try {
      httpPost.setEntity(new StringEntity(json));
      httpPost.addHeader("Content-Type", "application/json");
    } catch (UnsupportedEncodingException un) {
      logger.error(un);
      throw new RuntimeException("Error building HttpPost String Entity: " + un.getMessage());
    }

    return httpPost;
  }

  protected CloseableHttpResponse sendPost(String endpoint, String json) {
    HttpPost httpPost = getHttpPost(endpoint, json);
    try {
      omLogger.log("SoaWebServices Request to " + endpoint + " Starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);
      omLogger.log("SoaWebServices Request to " + endpoint + " Completed");
      return httpResponse;
    } catch (IOException io) {
      logger.error(io);
      omLogger.log("Request to " + endpoint + " failed");
      throw new RuntimeException("Error sending request to SoaWebServices " + io.getMessage());
    }
  }

  protected String parseHttpResponse(CloseableHttpResponse httpResponse, String endpoint) {
    if ( httpResponse == null ) throw new RuntimeException("No response got from SoaWebService endpoint: " + endpoint);
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
    sb.append("SoaWebService");
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

}
