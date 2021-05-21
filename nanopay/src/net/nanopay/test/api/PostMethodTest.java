package net.nanopay.test.api;

import static foam.mlang.MLang.EQ;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;

public class PostMethodTest
  extends ApiTestBase {


  public void runTest(X x) throws MalformedURLException, ProtocolException, UnsupportedEncodingException, IOException {

    
      // Enable the test user.
      DAO  localUserDAO = ( (DAO) x.get("localUserDAO") ).inX(x);
      User user         = (User) ( localUserDAO.find(EQ(User.EMAIL, "developer@nanopay.net")) ).fclone();
      user.setLoginEnabled(true);
      localUserDAO.put(user);

      // Create the request
      String sugarUrl = this.getBaseUrl(x) + "/service/sugar";
      HttpURLConnection connection = this.createRequest(sugarUrl, "POST");
      connection.setRequestProperty("Content-Type", "application/json");
      
      String st = "{\n" + 
          "    \"service\": \"auth\",\n" + 
          "    \"interfaceName\": \"foam.nanos.auth.AuthService\",\n" + 
          "    \"method\": \"checkUser\",\n" + 
          "    \"X\": \"X\",\n" + 
          "    \"permission\":\"menu.read.integration\",\n" + 
          "    \"user\":"+ user.toJSON() +
          "}";
      
      connection.setDoOutput(true);
      OutputStream os = connection.getOutputStream();
      os.write(st.getBytes());
      os.flush();
      os.close();

      // Execute the call
      int responseCode = connection.getResponseCode();

      test(200 == responseCode, "[" + sugarUrl + "] Response status should be 200 - actual: " + responseCode);
      if ( 200 != responseCode ) return;

      // Show response data
      String s = this.getResponseData(connection);

      // TODO the response have whitespace that need to be deleted.
      // to convert it to appropriate type.
      // boolean response = Boolean.valueOf(s);
      test(s.contains("true"), "the same user can act as it self");
  }
}
