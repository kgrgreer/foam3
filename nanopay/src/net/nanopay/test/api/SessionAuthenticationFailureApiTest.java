package net.nanopay.api;

import java.util.Map;
import java.util.List;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.Reader;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Base64;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.test.Test;

// API Authentication tests.
public class SessionAuthenticationFailureApiTest extends ApiTestBase { 
  
  // Create the transaction summary report
  public void runTest(X x) {
    try 
    {
      // Create the request
      String digUrl = this.getBaseUrl(x);
      digUrl += (digUrl.endsWith("/")) ? "service/dig" :  "/service/dig";
      HttpURLConnection connection = this.createRequest(digUrl);

      // Execute the call
      int responseCode = connection.getResponseCode();
      test(200 == responseCode, "[" + digUrl + "] Response status should be 200 - actual: " + responseCode);
      if (200 != responseCode)
        return;

      // Print the headers
      String responseData = null;
      String sessionCookie = this.getSessionId(connection, false);
      test(null != sessionCookie && "" != sessionCookie, "Session cookie should be set. SessionId: " + sessionCookie);
      
      // Attempt to send a request with an invalid session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);
      responseCode = connection.getResponseCode();
      responseData = this.getResponseData(connection);
      test(200 == responseCode, "Response status when using session ID should be 200 - actual: " + responseCode);
      test(null == responseData || "".equals(responseData), "Response data should be empty, not a redirect to the login screen: (" + responseData + ")");

      // Update the session cookie to be invalid
      sessionCookie = "aa12" + sessionCookie;

      // Attempt to send a request with an invalid session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);
      
      // Check the response code
      responseCode = connection.getResponseCode();
      responseData = this.getResponseData(connection);
      test(200 == responseCode, "Response status when using an invalid session ID is still 200, but response data should not be empty - actual: " + responseCode);
      test(null != responseData && !"".equals(responseData), "Response data should not be empty It should redirect to the login screen: (" + responseData + ")");
    }
    catch (Exception ex)
    {
      print(ex.toString());
    }
  }
}
