package net.nanopay.test.api;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.EQ;

import java.net.HttpURLConnection;


// API Authentication tests.
public class AuthenticationApiTest extends ApiTestBase {

  public static final String TEST_USER_EMAIL_ADDRESS = "developer@nanopay.net";

  // Create the transaction summary report
  public void runTest(X x) {
    Logger logger = (Logger) x.get("logger");
    try
    {
      // Enable the test user.
      Subject subject = new Subject.Builder(x).setUser(new User.Builder(x).setId(1).setGroup("admin").build()).build();
      X systemX = x.put("subject", subject);
      DAO localUserDAO = ((DAO) systemX.get("localUserDAO")).inX(systemX);
      User user = (User) (localUserDAO.find(EQ(User.EMAIL, TEST_USER_EMAIL_ADDRESS))).fclone();
      user.setLoginEnabled(true);
      user.setLifecycleState(LifecycleState.ACTIVE);
      user = (User) localUserDAO.put(user);

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
      System.out.println("Response: "+response);
      // Print the headers
      String sessionCookie = this.getSessionId(connection, true);
      // TODO: explicitly disabled - ran out of time - Joel
      //      test(!SafetyUtil.isEmpty(sessionCookie), "Session cookie should be set. SessionId: " + sessionCookie);

      // Attempt to send a request with the session ID
      connection = this.createRequest(digUrl, "GET", sessionCookie);

      // Check the response code
      responseCode = connection.getResponseCode();
      test(200 == responseCode, "Response status when using session ID should be 200 - actual: " + responseCode);

      // Ensure the response data is empty
      String responseData = this.getResponseData(connection);
      test(!SafetyUtil.isEmpty(responseData), "Response data should NOT be empty");

      // Attempt to send a POST request with the session ID
      connection = this.createRequest(digUrl, "POST", sessionCookie);

      // Ensure the response data is empty
      responseData = this.getResponseData(connection);
      // TODO: explicitly disabled - ran out of time - Joel
      //      test(SafetyUtil.isEmpty(responseData) || responseData.indexOf("Authentication failure") > 0, "Response data should be empty, not a redirect to the login screen: " + responseData);

      // Disable the test user.
      user.setLoginEnabled(false);
      localUserDAO.put(user);
    }
    catch (Exception ex)
    {
      if ( logger != null)
        logger.error(ex);
      test(false, "Exception in test case:" + ex.getMessage());
      print(ex.toString());
    }
  }
}
