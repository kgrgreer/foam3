package net.nanopay.meter.compliance.dowJones;

import foam.core.ContextAwareSupport;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.impl.client.HttpClientBuilder;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Base64;
import java.util.Date;
import java.text.SimpleDateFormat;

// apache

/**
 * The DowJonesRestService is used to make a call to the Dow Jones Risk Database
 */

 public class DowJonesRestService
  extends ContextAwareSupport
  implements DowJonesRestInterface
{
  public static final String PERSON_NAME = "person-name?";
  public static final String ENTITY_NAME = "entity-name?";

  public DowJonesResponseMsg serve(DowJonesRequestMsg msg, String requestInfo) {
    if ( ! requestInfo.equals("") ) {
      return baseSearchService(msg);
    } else {
      return null;
    }
  }

  public DowJonesResponseMsg baseSearchService(DowJonesRequestMsg msg) {
    DowJonesResponseMsg response = request(msg);

    if ( response.getHttpStatusCode() == 200 ) {
      response.setModelInfo(DowJonesResponse.getOwnClassInfo());
    } else {
      response.setModelInfo(DowJonesInvalidResponse.getOwnClassInfo());
    }
    return response;
  }

  public DowJonesResponseMsg request(DowJonesRequestMsg req) {
    DowJonesCredentials credentials = (DowJonesCredentials) getX().get("dowjonesCredentials");

    String authCredentials = credentials.getNamespace() + "/" + credentials.getUsername() + ":" + credentials.getPassword();
    String encodedCredentials = Base64.getEncoder().encodeToString((authCredentials).getBytes());

    String baseUrl = credentials.getBaseUrl();
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

      String urlAddress = "";
      String pattern = "yyyy-MM-dd";
      SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);

      if ( req.getRequestInfo().equals(PERSON_NAME) ) {
        String firstName = ((PersonNameSearchRequest) req.getModel()).getFirstName();
        String surName = ((PersonNameSearchRequest) req.getModel()).getSurName();
        Date filterLRDFrom = ((PersonNameSearchRequest) req.getModel()).getFilterLRDFrom();
        if ( filterLRDFrom != null ) {
          String formattedFilter = simpleDateFormat.format(filterLRDFrom);
          urlAddress = baseUrl + req.getRequestInfo() + "first-name=" + firstName + "&surname=" + surName + "&filter-lrd-from=" + formattedFilter;
        } else {
          urlAddress = baseUrl + req.getRequestInfo() + "first-name=" + firstName + "&surname=" + surName;
        }
      } else if ( req.getRequestInfo().equals(ENTITY_NAME) ) {
        String entityName = ((EntityNameSearchRequest) req.getModel()).getEntityName();
        Date filterLRDFrom = ((EntityNameSearchRequest) req.getModel()).getFilterLRDFrom();
        if ( filterLRDFrom != null ) {
          String formattedFilter = simpleDateFormat.format(filterLRDFrom);
          urlAddress = baseUrl + req.getRequestInfo() + "entity-name=" + entityName + "&filter-lrd-from=" + formattedFilter;
        } else {
          urlAddress = baseUrl + req.getRequestInfo() + "entity-name=" + entityName;
        }
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
      return msg;
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(rd);
      HttpClientUtils.closeQuietly(response);
      HttpClientUtils.closeQuietly(client);
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
