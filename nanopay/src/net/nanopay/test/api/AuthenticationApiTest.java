package net.nanopay.test.api;

import foam.core.X;
import foam.util.SafetyUtil;

import java.net.HttpURLConnection;


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
      test(200 == responseCode, "[" + digUrl + "] Response status should be 200 - actual: " + responseCode);
      if (200 != responseCode)
        return;
      
      // Show response data
      String response = this.getResponseData(connection);
      print("Response: " + response);

      // Print the headers
      String sessionCookie = this.getSessionId(connection, true);
      test(!SafetyUtil.isEmpty(sessionCookie), "Session cookie should be set. SessionId: " + sessionCookie);
      
      // Attempt to send a request with the session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);
      
      // Check the response code
      responseCode = connection.getResponseCode();
      test(200 == responseCode, "Response status when using session ID should be 200 - actual: " + responseCode);

      // Ensure the response data is empty
      String responseData = this.getResponseData(connection);
      test(SafetyUtil.isEmpty(responseData), "Response data should be empty, not a redirect to the login screen: (" + responseData + ")");
    }
    catch (Exception ex)
    {
      print(ex.toString());
    }
  }
}
