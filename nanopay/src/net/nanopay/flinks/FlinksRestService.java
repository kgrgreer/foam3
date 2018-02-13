package net.nanopay.flinks;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

import foam.core.ContextAwareSupport;
import foam.core.X;
import net.nanopay.flinks.model.*;

//apach
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.commons.io.IOUtils;
import org.apache.http.util.EntityUtils;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.client.config.RequestConfig;

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
  public static final String ACCOUNTS_STATEMENTS = "GetStatements";
  public static final String CHALLENGE = "Challenge";

  private String address_;

  public FlinksRestService() {
    this(null, "8bc4718b-3780-46d0-82fd-b217535229f1");
  }
  public FlinksRestService(X x, String customerId) {
    this(x, "https://nanopay-api.private.fin.ag/v3", customerId);
  }
  public FlinksRestService(X x, String url, String customerId) {
    address_ = url + "/" + customerId + "/" + "BankingServices";
    setX(x);
  }

  public ResponseMsg serve(RequestMsg msg, String RequestInfo) {
    if ( RequestInfo.equals(AUTHORIZE) ) {
      return authorizeService(msg);
    } else if ( RequestInfo.equals(CHALLENGE) ) {
      return challengeService(msg);
    } if ( RequestInfo.equals(AUTHORIZE_MULTIPLE) ) {
      return null;
    } else if ( RequestInfo.equals(ACCOUNTS_SUMMARY) ) {
      return accountsSummaryService(msg);
    } else if ( RequestInfo.equals(ACCOUNTS_STATEMENTS) ) {
      return null;
    } else if ( RequestInfo.equals(ACCOUNTS_DETAIL) ) {
      return accountsDetailService(msg);
    } else if ( RequestInfo.equals(WAIT_SUMMARY) ) {
      return null;
    } else {
      return null;
    }
  }

  public ResponseMsg authorizeService(RequestMsg msg) {
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
  }

  public ResponseMsg challengeService(RequestMsg msg) {
    ResponseMsg resp = request(msg);
    if ( resp.getHttpStatusCode() == 203 ) {
      //MFA challenge
      resp.setModelInfo(FlinksMFAResponse.getOwnClassInfo());
    } else if ( resp.getHttpStatusCode() == 200 ) {
      //success authorize
      resp.setModelInfo(FlinksAuthResponse.getOwnClassInfo());
    } else if ( resp.getHttpStatusCode() == 401) {
      //Error in MFA
      resp.setModelInfo(FlinksMFAResponse.getOwnClassInfo());
    } else {
      //Error response
      resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
    }
    return resp;
  }

  public ResponseMsg accountsDetailService(RequestMsg msg) {
    ResponseMsg resp = request(msg);

    if ( resp.getHttpStatusCode() == 200 ) {
      resp.setModelInfo(FlinksAccountsDetailResponse.getOwnClassInfo());
    } else {
      resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
    }
    return resp;
  }

  public ResponseMsg accountsSummaryService(RequestMsg msg) {
    ResponseMsg resp = request(msg);
    
    if ( resp.getHttpStatusCode() == 200 ) {
      resp.setModelInfo(FlinksAccountsSummaryResponse.getOwnClassInfo());
    } else {
      resp.setModelInfo(FlinksInvalidResponse.getOwnClassInfo());
    }
    return resp;
  }

  private ResponseMsg request(RequestMsg req) {
    BufferedReader rd = null;
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
      HttpPost post = new HttpPost(address_ + "/" + req.getRequestInfo());
      post.setHeader("Connection","keep-alive");
      post.setHeader("Content-Type","application/json");
      //System.out.println("Send: " + req.getJson());
      HttpEntity entity = new ByteArrayEntity(req.getJson().getBytes("UTF-8"));
      post.setEntity(entity);
      response = client.execute(post);
      int statusCode =  response.getStatusLine().getStatusCode();
      responseEntity = response.getEntity();
      rd = new BufferedReader(new InputStreamReader(responseEntity.getContent()));
      StringBuilder res = builders.get();
      String line = "";
      while ((line = rd.readLine()) != null) {
        res.append(line);
      }
      System.out.println("Receive: " + res.toString());
      msg = new ResponseMsg(getX(), res.toString());
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

  private void closeSource(InputStream is, OutputStream os, HttpURLConnection connection) {
    if ( os != null ) {
      try {
        os.close();
      } catch ( IOException e ) {
        e.printStackTrace();
      }
    }
    if ( is != null ) {
      try {
        is.close();
      } catch ( IOException e ) {
        e.printStackTrace();
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