package net.nanopay.test.api;

import foam.core.X;
import foam.util.SafetyUtil;

import java.net.HttpURLConnection;

// API Authentication tests.
public class SessionAuthenticationFailureApiTest extends ApiTestBase { 
  
  // Create the transaction summary report
  public void runTest(X x) {
    try 
    {
      // Create the request
      String digUrl = this.getBaseUrl(x) + "/service/dig";
      HttpURLConnection connection = this.createRequest(digUrl);

      // Execute the call
      int responseCode = connection.getResponseCode();
      test(200 == responseCode, "[" + digUrl + "] Response status should be 200 - actual: " + responseCode);
      if (200 != responseCode)
        return;

      // Print the headers
      String responseData = null;
      String sessionCookie = this.getSessionId(connection, false);
      test(!SafetyUtil.isEmpty(sessionCookie), "Session cookie should be set. SessionId: " + sessionCookie);
      
      // Attempt to send a request with an invalid session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);
      responseCode = connection.getResponseCode();
      responseData = this.getResponseData(connection);
      test(200 == responseCode, "Response status when using session ID should be 200 - actual: " + responseCode);
      test(SafetyUtil.isEmpty(responseData), "Response data should be empty, not a redirect to the login screen: (" + responseData + ")");

      // Update the session cookie to be invalid
      sessionCookie = "aa12" + sessionCookie;

      // Attempt to send a request with an invalid session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);
      
      // Check the response code
      responseCode = connection.getResponseCode();
      responseData = this.getResponseData(connection);
      test(200 == responseCode, "Response status when using an invalid session ID is still 200, but response data should not be empty - actual: " + responseCode);
      test(!SafetyUtil.isEmpty(responseData), "Response data should not be empty It should redirect to the login screen: (" + responseData + ")");
    }
    catch (Exception ex)
    {
      print(ex.toString());
    }
  }
}
