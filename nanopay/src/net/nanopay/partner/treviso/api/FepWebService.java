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
package net.nanopay.partner.treviso.api;

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
import foam.util.StringUtil;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.util.Map;
import net.nanopay.partner.treviso.api.FepWebResponse;
import net.nanopay.partner.treviso.api.LoginRequest;
import net.nanopay.partner.treviso.api.LoginResponse;
import net.nanopay.partner.treviso.api.SaveEntityRequest;
import net.nanopay.partner.treviso.TrevisoCredientials;
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


public class FepWebService extends ContextAwareSupport implements FepWeb {

  private CloseableHttpClient httpClient;
  private JSONParser jsonParser;
  private Logger logger;
  private OMLogger omLogger;

  public FepWebService(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
    logger = new PrefixLogger(new Object[]{this.getClass().getSimpleName()}, logger);
    omLogger = (OMLogger) x.get("OMLogger");
    jsonParser = new JSONParser();
    jsonParser.setX(x);
  }

  protected TrevisoCredientials getCredentials() {
    TrevisoCredientials credentials = (TrevisoCredientials) getX().get("trevisoCredientials");
    if ( credentials == null ||
         SafetyUtil.isEmpty(credentials.getFepWebUsername()) ||
         SafetyUtil.isEmpty(credentials.getFepWebPassword()) ||
         SafetyUtil.isEmpty(credentials.getFepWebApi()) ) {
      logger.error(this.getClass().getSimpleName(), "Invalid credentials");
      throw new RuntimeException("Invalid credentials");
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

  protected CloseableHttpResponse sendPost(HttpPost httpPost, String endpoint) {
    try {
      omLogger.log("Treviso Request to " + endpoint + " Starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);
      omLogger.log("Treviso Request to " + endpoint + " Completed");
      return httpResponse;
    } catch (IOException io) {
      logger.error(io);
      omLogger.log("Treviso Request to " + endpoint + " failed");
      throw new RuntimeException("Error sending request to Treviso " + io.getMessage());
    }
  }

  protected CloseableHttpResponse sendGet(String endpoint, Map<String, String> params) {
    try {
      URIBuilder uriBuilder = new URIBuilder(endpoint);
      for ( Map.Entry<String, String> entry : params.entrySet() ) {
        uriBuilder.setParameter(entry.getKey(), entry.getValue());
      }
      HttpGet httpGet = new HttpGet(uriBuilder.build());
      System.out.println("URI builder: " + httpGet.getURI());
      omLogger.log("Treviso Request to " + endpoint + " Starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);
      omLogger.log("Treviso Request to " + endpoint + " Completed");
      return httpResponse;
    } catch (IOException io) {
      logger.error(io);
      omLogger.log("Treviso Request to " + endpoint + " failed");
      throw new RuntimeException("Error sending request to Treviso " + io.getMessage());
    } catch (URISyntaxException e) {
      logger.error(e);
      throw new RuntimeException("URI syntax error while sending request to " + endpoint + e.getMessage());
    }
  }

  protected CloseableHttpResponse sendPost(String endpoint, String json)  {
    return sendPost(endpoint, json, true);
  }

  protected CloseableHttpResponse sendPost(String endpoint, String json, boolean requireToken) {
    logRequestMessage(endpoint, json);
    HttpPost httpPost = new HttpPost(endpoint);

    try {
      httpPost.setEntity(new StringEntity(json));
      httpPost.addHeader("Content-Type", "application/json");
    } catch (UnsupportedEncodingException un) {
      logger.error(un);
      throw new RuntimeException("Error building HttpPost String Entity: " + un.getMessage());
    }

    if ( requireToken ) {
      try {
        httpPost.addHeader(setTokenHeader());
      } catch (Throwable t) {
        logger.error(t);
        throw new RuntimeException("Error Setting FepWeb Token: " + t.getMessage());
      }
    }

    return sendPost(httpPost, endpoint);
  }

  protected Header setTokenHeader() {
    Header header = null;
    TrevisoCredientials credentials = getCredentials();
    LoginRequest request = new LoginRequest.Builder(getX()).setUsername(credentials.getFepWebUsername())
      .setPassword(credentials.getFepWebPassword()).build();

    LoginResponse loginResponse = authenticate(request);
    if ( loginResponse != null ) {
      header = new BasicHeader("FEPWEB-JWT-TOKEN", loginResponse.getToken());
    }
    return header;
  }

  protected String parseHttpResponse(CloseableHttpResponse httpResponse, String endpoint) {
    if ( httpResponse == null ) throw new RuntimeException("No response got from Treviso endpoint: " + endpoint);
    try {
      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 )
        return parseHttpResponseError(endpoint, httpResponse);

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
    String responseString = "";
    if ( httpResponse == null  ) return responseString;
    StringBuilder sb = new StringBuilder();
    sb.append("Treviso ");
    sb.append(endpoint);
    sb.append(" failed with: ");
    sb.append(httpResponse.getStatusLine().getStatusCode());
    sb.append(" - ");
    sb.append(httpResponse.getStatusLine().getReasonPhrase());
    try {
      responseString = EntityUtils.toString(httpResponse.getEntity(), "UTF-8");
      sb.append(responseString);
    } catch (Exception e) {
      logger.error(sb.toString());
    }
    EntityUtils.consumeQuietly(httpResponse.getEntity());
    logger.error(sb.toString());
    return responseString;
  }

  protected String getJsonMessage(FObject obj) {
    String json = null;

    try(Outputter jsonOutputter = new Outputter(getX()).setOutputShortNames(true).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
      json = jsonOutputter.stringify(obj);
    } catch(Exception e) {
      logger.error(e);
    }
    return StringUtil.normalize(json);
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

  @Override
  public LoginResponse authenticate(LoginRequest request) {
    LoginResponse loginResponse = null;
    String endpoint = getCredentials().getFepWebApi() + "authenticate/authorize";
    try{
      CloseableHttpResponse response = sendPost(endpoint, getJsonMessage(request), false);
      loginResponse = (LoginResponse) jsonParser.parseString(parseHttpResponse(response, endpoint), LoginResponse.class);
      if ( loginResponse != null ) {
        Header[] fepWebHeader = response.getHeaders("FEPWEB-JWT-TOKEN");
        if (fepWebHeader != null && fepWebHeader.length > 0) {
          loginResponse.setToken(fepWebHeader[0].getValue());
        }
      }
      return loginResponse;
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }

  @Override
  public FepWebResponse saveEntity(SaveEntityRequest request) {
    try {
      String endpoint = getCredentials().getFepWebApi() + "entities/save";
      CloseableHttpResponse httpResponse = sendPost(endpoint, getJsonMessage(request));
      if ( httpResponse.getStatusLine().getStatusCode() / 100 == 2 ) {
        FepWebResponse res = new FepWebResponse();
        res.setCode(0);
        return res;
      }
      return (FepWebResponse) jsonParser.parseString(parseHttpResponse(httpResponse, endpoint), FepWebResponse.class);
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }

  public SearchCustomerResponse searchCustomer(SearchCustomerRequest request) {
    try {
      String endpoint = getCredentials().getFepWebApi() + "entities/getEntity";
      CloseableHttpResponse httpResponse = sendPost(endpoint, getJsonMessage(request));
      return (SearchCustomerResponse) jsonParser.parseString(parseHttpResponse(httpResponse, endpoint), SearchCustomerResponse.class);
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }

  public GetDocumentTypeResponse getDocumentTypes(GetDocumentTypeRequest request) {
    try {
      String endpoint = getCredentials().getFepWebApi() + "basic/documentType/search";
      CloseableHttpResponse httpResponse = sendPost(endpoint, getJsonMessage(request));
      return (GetDocumentTypeResponse) jsonParser.parseString(parseHttpResponse(httpResponse, endpoint), GetDocumentTypeResponse.class);
    } catch (Exception e) {
      logger.error(e);
      throw e;
    }
  }
}
