package net.nanopay.flinks;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;

import foam.core.X;
import foam.nanos.pm.PM;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;

import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.impl.client.HttpClientBuilder;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.flinks.model.FlinksAccountDetailAsyncRequest;
import net.nanopay.flinks.model.FlinksAccountsDetailResponse;
import net.nanopay.flinks.model.FlinksAccountsSummaryResponse;
import net.nanopay.flinks.model.FlinksAuthResponse;
import net.nanopay.flinks.model.FlinksCredentials;
import net.nanopay.flinks.model.FlinksInvalidResponse;
import net.nanopay.flinks.model.FlinksMFAResponse;

/**
 * The FlinksRestService is used to make a call to the Flinks
 */
public class FlinksRestService
  extends ContextAwareSupport
{
  public static final String REST_GET = "GET";
  public static final String REST_POST = "POST";
  public static final String AUTHORIZE = "Authorize";
  public static final String AUTHORIZE_MULTIPLE = "AuthorizeMultiple";
  public static final String ACCOUNTS_SUMMARY = "GetAccountsSummary";
  public static final String WAIT_SUMMARY = "WaitSummary";
  public static final String ACCOUNTS_DETAIL = "GetAccountsDetail";
  public static final String ACCOUNTS_DETAIL_ASYNC = "GetAccountsDetailAsync";
  public static final String ACCOUNTS_STATEMENTS = "GetStatements";
  public static final String CHALLENGE = "Challenge";

  public ResponseMsg serve(RequestMsg msg, String RequestInfo) {
    if ( RequestInfo.equals(AUTHORIZE) ) {
      return authorizeService(msg);
    }
    if ( RequestInfo.equals(CHALLENGE) ) {
      return challengeService(msg);
    }
    if ( RequestInfo.equals(AUTHORIZE_MULTIPLE) ) {
      return null;
    }
    if ( RequestInfo.equals(ACCOUNTS_SUMMARY) ) {
      return accountsSummaryService(msg);
    }
    if ( RequestInfo.equals(ACCOUNTS_STATEMENTS) ) {
      return null;
    }
    if ( RequestInfo.equals(ACCOUNTS_DETAIL) || RequestInfo.equals(ACCOUNTS_DETAIL_ASYNC) ) {
      return accountsDetailService(msg);
    }
    return null;
  }

  public ResponseMsg authorizeService(RequestMsg msg) {
    var pm = new PM(FlinksRestService.class.getSimpleName(), "authorizeService");

    try {
      ResponseMsg resp = request(msg);
      if ( resp.getHttpStatusCode() == 203 ) {
        //MFA challenge
        resp.setModelInfo(FlinksMFAResponse.getOwnClassInfo());
      } else if ( resp.getHttpStatusCode() == 200 ) {
        //success authorize
        resp.setModelInfo(FlinksAuthResponse.getOwnClassInfo());
      } else {
        //Error response
        resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
      }
      return resp;
    } catch (Throwable t) {
      pm.error(getX(), t.getMessage());
      throw t;
    } finally {
      pm.log(getX());
    }
  }

  public ResponseMsg challengeService(RequestMsg msg) {
    var pm = new PM(FlinksRestService.class.getSimpleName(), "challengeService");

    try {
      ResponseMsg resp = request(msg);
      if (resp.getHttpStatusCode() == 203) {
        //MFA challenge
        resp.setModelInfo(FlinksMFAResponse.getOwnClassInfo());
      } else if (resp.getHttpStatusCode() == 200) {
        //success authorize
        resp.setModelInfo(FlinksAuthResponse.getOwnClassInfo());
      } else if (resp.getHttpStatusCode() == 401) {
        //Error in MFA
        resp.setModelInfo(FlinksMFAResponse.getOwnClassInfo());
      } else {
        //Error response
        resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
      }
      return resp;
    } catch(Throwable t) {
      pm.error(getX(), t.getMessage());
      throw t;
    } finally {
      pm.log(getX());
    }
  }

  public ResponseMsg accountsDetailService(RequestMsg msg) {
    var pm = new PM(FlinksRestService.class.getSimpleName(), "accountsDetailService");

    try {
      ResponseMsg resp = request(msg);

      if (resp.getHttpStatusCode() == 200) {
        resp.setModelInfo(FlinksAccountsDetailResponse.getOwnClassInfo());
      } else {
        resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
      }
      return resp;
    } catch(Throwable t) {
      pm.error(getX(), t.getMessage());
      throw t;
    } finally {
      pm.log(getX());
    }
  }

  public ResponseMsg accountsSummaryService(RequestMsg msg) {
    var pm = new PM(FlinksRestService.class.getSimpleName(), "authorizeService");

    try {
      ResponseMsg resp = request(msg);

      if (resp.getHttpStatusCode() == 200) {
        resp.setModelInfo(FlinksAccountsSummaryResponse.getOwnClassInfo());
      } else {
        resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
      }
      return resp;
    } catch(Throwable t) {
      pm.error(getX(), t.getMessage());
      throw t;
    } finally {
      pm.log(getX());
    }
  }

  private ResponseMsg request(RequestMsg req) {
    DAO               notificationDAO = (DAO) getX().get("notificationDAO");
    Logger            logger          = (Logger) getX().get("logger");
    FlinksCredentials credentials     = (FlinksCredentials) getX().get("flinksCredentials");

    if ( "".equals(credentials.getUrl()) || "".equals(credentials.getCustomerId()) ) {
      logger.error("Flinks credentials not found");
      Notification notification = new Notification.Builder(getX())
        .setTemplate("NOC")
        .setBody("Flinks credentials not found")
        .build();
      notificationDAO.put(notification);
      return null;
    }
    String address_ = credentials.getUrl() + "/" + credentials.getCustomerId() + "/" + "BankingServices";

    HttpEntity responseEntity = null;
    HttpResponse response = null;
    HttpClient client = null;
    ResponseMsg msg = null;
    try {
      int timeout = 30;
      RequestConfig config = RequestConfig.custom()
        .setConnectTimeout(timeout*1000)
        .setConnectionRequestTimeout(timeout*1000).build();
      client = HttpClientBuilder.create().setDefaultRequestConfig(config).build();
      client = HttpClientBuilder.create().build();

      String urlAddress = "";
      if ( req.getRequestInfo().equals(ACCOUNTS_DETAIL_ASYNC) ) {
        String requestId = ((FlinksAccountDetailAsyncRequest) req.getModel()).getRequestId();
        urlAddress = address_ + "/" + req.getRequestInfo() + "/" + requestId;
        HttpGet get = new HttpGet(urlAddress);
        get.setHeader("Connection","keep-alive");
        get.setHeader("Content-Type","application/json");
        response = client.execute(get);
      } else {
        urlAddress = address_ + "/" + req.getRequestInfo();
        HttpPost post = new HttpPost(urlAddress);
        post.setHeader("Connection","keep-alive");
        post.setHeader("Content-Type","application/json");
        HttpEntity entity = new ByteArrayEntity(req.getJson().getBytes("UTF-8"));
        post.setEntity(entity);
        response = client.execute(post);
      }

      int statusCode = response.getStatusLine().getStatusCode();
      responseEntity = response.getEntity();

      StringBuilder res = builders.get();
      String line = "";

      try(BufferedReader rd = new BufferedReader(new InputStreamReader(responseEntity.getContent()))) {
    	  while ((line = rd.readLine()) != null) {
    	        res.append(line);
    	      }
      }

      msg = new ResponseMsg(getX(), res.toString());
      msg.setHttpStatusCode(statusCode);
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      HttpClientUtils.closeQuietly(response);
      HttpClientUtils.closeQuietly(client);
    }
    return msg;
  }

  private void closeSource(X x, InputStream is, OutputStream os, HttpURLConnection connection) {
    Logger logger = (Logger) x.get("logger");
    if ( os != null ) {
      try {
        os.close();
      } catch ( IOException e ) {
        logger.log(e);
      }
    }
    if ( is != null ) {
      try {
        is.close();
      } catch ( IOException e ) {
        logger.log(e);
      }
    }
    if ( connection != null ) {
      connection.disconnect();
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
