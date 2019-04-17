package net.nanopay.meter.compliance.dowJones;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.meter.compliance.dowJones.*;

// apache
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.commons.io.IOUtils;
import org.apache.http.util.EntityUtils;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.client.config.RequestConfig;

/**
 * The DowJonesRestService is used to make a call to the Dow Jones Risk Database
 */

 public class DowJonesRestService
  extends ContextAwareSupport
{
  public static final String PERSON_NAME = "person-name?";
  public static final String ENTITY_NAME = "entity-name?";


  public DowJonesResponseMsg serve(DowJonesRequestMsg msg, String RequestInfo) {
    if ( ! RequestInfo.equals("") ) {
      return baseSearchService(msg);
    } else {
      return null;
    }
  }

  public DowJonesResponseMsg baseSearchService(DowJonesRequestMsg msg) {
    DowJonesResponseMsg response = request(msg);

    if ( response.getHttpStatusCode() == 200 ) {
      response.setModelInfo(BaseSearchResponse.getOwnClassInfo());
    } else {
      response.setModelInfo(BaseSearchInvalidResponse.getOwnClassInfo());
    }
    return response;
  }
  
  private DowJonesResponseMsg request(DowJonesRequestMsg req) {
    DowJonesCredentials credentials = (DowJonesCredentials) getX().get("dowjonesCredentials");

    String authCredentials = credentials.getNamespace() + "/" + credentials.getUsername() + ":" + credentials.getPassword();
    String encodedCredentials = Base64.getEncoder().encodeToString((authCredentials).getBytes());

    BufferedReader rd = null;
    HttpEntity responseEntity = null;
    HttpResponse response = null;
    HttpClient client = null;
    DowJonesResponseMsg msg = null;
    try {
      int timeout = 30;
      RequestConfig config = RequestConfig.custom()
        .setConnectTimeout(timeout*1000)
        .setConnectionRequestTimeout(timeout*1000).build();
      client = HttpClientBuilder.create().setDefaultRequestConfig(config).build();
      client = HttpClientBuilder.create().build();

      String baseUrl = "https://djrc.api.test.dowjones.com/v1/search/";
      String urlAddress = "";

      if ( req.getRequestInfo().equals(PERSON_NAME) ) {
        String firstName = ((PersonNameSearchRequest) req.getModel()).getFirstName();
        String surName = ((PersonNameSearchRequest) req.getModel()).getSurName();
        urlAddress = baseUrl + req.getRequestInfo() + "first-name=" + firstName + "&surname=" + surName;
      } else if ( req.getRequestInfo().equals(ENTITY_NAME) ) {
        String entityName = ((EntityNameSearchRequest) req.getModel()).getEntityName();
        urlAddress = baseUrl + req.getRequestInfo() + "entity-name=" + entityName;
      }
      
      HttpGet get = new HttpGet(urlAddress);
      get.setHeader("Authorization", "Basic " + encodedCredentials);
      response = client.execute(get);

      int statusCode = response.getStatusLine().getStatusCode();
      responseEntity = response.getEntity();
      rd = new BufferedReader(new InputStreamReader(responseEntity.getContent()));
      StringBuilder res = builders.get();
      String line = "";
      while ((line = rd.readLine()) != null) {
        res.append(line);
      }
      msg = new DowJonesResponseMsg(getX(), res.toString());
      msg.setHttpStatusCode(statusCode);
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(rd);
      HttpClientUtils.closeQuietly(response);
      HttpClientUtils.closeQuietly(client);
      return msg;
    }
  }

  protected ThreadLocal<StringBuilder> builders = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }
    @Override
    public StringBuilder get() {
      StringBuilder sb = super.get();
      sb.setLength(0);
      return sb;
    }
  };

}
