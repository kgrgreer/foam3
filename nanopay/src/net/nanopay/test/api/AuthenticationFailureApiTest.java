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

// API Authentication failure tests.
public class AuthenticationFailureApiTest extends ApiTestBase { 
  
  // Create the transaction summary report
  public void runTest(X x) {
    try 
    {
      // Create the request
      String digUrl = this.getBaseUrl(x) + "/service/dig";
      HttpURLConnection connection = this.createRequest(digUrl, "GET", "developer@nanopay.net", "Inc0rrectP@ssword");
      
      // Execute the call
      int responseCode = connection.getResponseCode();
      test(401 == responseCode, "[" + digUrl + "] Response status should be 401 - actual: " + responseCode);
    }
    catch (Exception ex)
    {
      test(false, "Exception in test case: " + ex.getMessage());
      print(ex.toString());
    }
  }
}
