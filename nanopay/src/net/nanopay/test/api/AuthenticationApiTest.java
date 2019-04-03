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
public class AuthenticationApiTest extends ApiTestBase { 
  
  // Create the transaction summary report
  public void runTest(X x) {
    try 
    {
      // Create the request
      String digUrl = this.getBaseUrl(x) + "/service/dig";
      HttpURLConnection connection = this.createRequest(digUrl);
      
      // Execute the call
      int responseCode = connection.getResponseCode();
      test(200 == responseCode, "Response status should be 200 - actual: " + responseCode);
      if (200 != responseCode)
        return;
      
      // Show response data
      String response = this.getResponseData(connection);
      print("Response: " + response);

      // Print the headers
      String sessionCookie = this.getSessionId(connection, true);
      test(null != sessionCookie && "" != sessionCookie, "Session cookie should be set. SessionId: " + sessionCookie);
      
      // Attempt to send a request with the session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);
      
      // Check the response code
      responseCode = connection.getResponseCode();
      test(200 == responseCode, "Response status when using session ID should be 200 - actual: " + responseCode);

      // Ensure the response data is empty
      String responseData = this.getResponseData(connection);
      test(null == responseData || "".equals(responseData), "Response data should be empty, not a redirect to the login screen: (" + responseData + ")");
    }
    catch (Exception ex)
    {
      print(ex.toString());
    }
  }
}
