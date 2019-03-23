package net.nanopay.meter.compliance.secureFact;

import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse;
import net.nanopay.meter.compliance.secureFact.lev.model.LEVResult;
import net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse;
import net.nanopay.model.Business;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.util.Arrays;
import java.util.Base64;

public class SecurefactService {
  public SIDniResponse sidniVerify(X x, User user) {
    SecurefactRequest request = SecurefactRequestGenerator.getSIDniRequest(x, user);
    SecurefactCredentials credentials = (SecurefactCredentials) x.get("securefactCredentials");
    request.setUrl(credentials.getSidniUrl());
    request.setAuthKey(credentials.getSidniApiKey());

    SIDniResponse response = (SIDniResponse) sendRequest(x, request);
    response.setEntityName(user.getLegalName());
    response.setEntityId(user.getId());
    return (SIDniResponse)
      ((DAO) x.get("secureFactSIDniDAO")).put(response);
  }

  public LEVResponse levSearch(X x, Business business) {
    SecurefactRequest request = SecurefactRequestGenerator.getLEVRequest(x, business);
    SecurefactCredentials credentials = (SecurefactCredentials) x.get("securefactCredentials");
    request.setUrl(credentials.getLevUrl());
    request.setAuthKey(credentials.getLevApiKey());

    LEVResponse response = (LEVResponse) sendRequest(x, request);
    response.setEntityName(business.getBusinessName());
    response.setEntityId(business.getId());
    // Aggregate close matches
    LEVResult[] results = response.getResults();
    long closeMatchCounter = Arrays.stream(results).filter(
      o -> o.getCloseMatch()
    ).count();
    response.setCloseMatches(closeMatchCounter + "/" + results.length);
    return (LEVResponse)
      ((DAO) x.get("secureFactLEVDAO")).put(response);
  }

  private SecurefactResponse sendRequest(X x, SecurefactRequest request) {
    CloseableHttpClient httpClient = HttpClients.createDefault();
    HttpPost httpPost = new HttpPost(request.getUrl());
    HttpResponse httpResponse = null;

    try {
      String basicAuth = request.getAuthKey() + ":";
      StringEntity entity = new StringEntity(
        new Outputter().setOutputClassNames(false).stringify(request));
      entity.setContentType("application/json");

      httpPost.addHeader("Content-type", "application/json");
      httpPost.setHeader("Authorization", "Basic " +
        Base64.getEncoder().encodeToString(basicAuth.getBytes()));
      httpPost.setEntity(entity);
      httpResponse =  httpClient.execute(httpPost);
      if ( httpResponse.getStatusLine().getStatusCode() >= 500 ) {
        throw new Exception("Securefact server error.");
      }

      String responseJson = EntityUtils.toString(httpResponse.getEntity());
      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      SecurefactResponse response = (SecurefactResponse)
        jsonParser.parseString(responseJson, SecurefactResponse.class);
      response.setStatusCode(httpResponse.getStatusLine().getStatusCode());
      return response;
    } catch(Exception e) {
      String message = String.format("Securefact %s failed.", request.getClass().getSimpleName());
      if ( httpResponse != null ) {
        message += String.format(" HTTP status code: %d.", httpResponse.getStatusLine().getStatusCode());
      }
      ((Logger) x.get("logger")).error(message, e);
      throw new RuntimeException(message);
    }
  }
}
