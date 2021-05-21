package net.nanopay.test.api.DAOSecurityTest;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.boot.NSpec;
import net.nanopay.test.api.ApiTestBase;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public abstract class DAOSecurityTest extends ApiTestBase {

  private static final String USER_AGENT = "Mozilla/5.0";
  protected static final Set<String> GLOBAL_IGNORES = new HashSet<>();

  public DAOSecurityTest() {
    // TODO: Review this list.
    GLOBAL_IGNORES.add("businessTypeDAO");
    GLOBAL_IGNORES.add("canadianSanctionDAO");
    GLOBAL_IGNORES.add("countryDAO");
    GLOBAL_IGNORES.add("deprecatedCapabilityJunctionDAO");
    GLOBAL_IGNORES.add("nSpecDAO");
    GLOBAL_IGNORES.add("prerequisiteCapabilityJunctionDAO");
    GLOBAL_IGNORES.add("regionDAO");
    GLOBAL_IGNORES.add("smeBusinessRegistrationDAO");
    GLOBAL_IGNORES.add("smeUserRegistrationDAO");
    GLOBAL_IGNORES.add("themeDAO");
    GLOBAL_IGNORES.add("themeDomainDAO");
    GLOBAL_IGNORES.add("userDAO");
    GLOBAL_IGNORES.add("userUserDAO");
    GLOBAL_IGNORES.add("localeDAO");
    GLOBAL_IGNORES.add("oauthProviderDAO");
    GLOBAL_IGNORES.add("commonPasswordDAO");
  }

  // Helper class for holding results
  static class TestDAOFailed extends Exception {
    private String msgBody;
    private String response;

    String getMsgBody() {
      return msgBody;
    }

    String getResponse() {
      return response;
    }

    TestDAOFailed(String msgBody_, String response_) {
      msgBody = msgBody_;
      response = response_;
    }
  }

  private boolean testDAO(X x, String dao, String request) throws ParseException, IOException, TestDAOFailed {
    String urlString = this.getBaseUrl(x) + "/service/"+dao;
    URL url = new URL(urlString);
    HttpURLConnection con = (HttpURLConnection) url.openConnection();

    con.setRequestMethod("POST");
    con.setRequestProperty("User-Agent", USER_AGENT);
    con.setRequestProperty("Accept-Language", "en-US,en;q=0.5");

    con.setDoOutput(true);
    DataOutputStream wr = new DataOutputStream(con.getOutputStream());
    wr.write(request.getBytes(StandardCharsets.UTF_8));
    wr.flush();
    wr.close();

    int responseCode = con.getResponseCode();
    String responseMessage = con.getResponseMessage();

    if (responseCode == HttpsURLConnection.HTTP_INTERNAL_ERROR) {
      throw new TestDAOFailed(responseCode + "/" + responseMessage, responseCode + "/" + responseMessage);
    }

    BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
    String inputLine;
    StringBuilder response = new StringBuilder();

    while ((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();

    JSONParser parser = new JSONParser();
    Object jso = parser.parse(response.toString());

    if ( ! (jso instanceof JSONObject) ) {
      throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }
    jso = ((JSONObject) jso).get("object");
    if ( ! (jso instanceof JSONObject) ) {
      throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }
    Object data = ((JSONObject) jso).get("data");
    if ( ! (data instanceof JSONObject) ) {
      throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }
    jso = ((JSONObject) data).get("id");
    if (jso == null) {
      throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }

    String sid = jso.toString();

    switch ( sid ) {
      case "foam.nanos.auth.AuthenticationException":
        return true;

      // If a DAO is decorated with ReadOnlyDAO then it will throw an
      // UnsupportedOperationException if anyone tries to put or remove items in
      // the DAO. That's an expected security measure, so we count such an
      // exception as successfully passing the test.
      case "java.lang.UnsupportedOperationException": // ReadOnlyDAO throws this.
        Object message = ((JSONObject) data).get("message");
        return message != null && message.toString().endsWith("ReadOnlyDAO");

      default:
        System.out.println("Got an instance of '" + sid + "' back from the server, which was unexpected.");
        throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }
  }

  // Run the test with a list of DAOs to ignore
  public void testAllDAOs(X x, String request, String command, List<String> ignores) {
    DAO nspecDAO = (DAO) x.get("nSpecDAO");
    List nspecs = ((ArraySink) nspecDAO.where(MLang.EQ(NSpec.SERVE, true)).select(new ArraySink())).getArray();

    // TODO: Use a sink instead of a list.
    for ( Object obj : nspecs ) {
      NSpec nspec = (NSpec)obj;

      // TODO: Use predicates for these conditions.
      if ( ! nspec.getName().endsWith("DAO") || ignores.contains(nspec.getName()) ) {
        System.out.println("Skipping " + nspec.getName());
        continue;
      }

      boolean result;

      try {
        result = testDAO(x, nspec.getName(), request);
      } catch ( TestDAOFailed e ) {
        System.out.println("TestDAOSecurityTest-"+nspec.getName()+" message: "+e.getMsgBody());
        System.out.println("TestDAOSecurityTest-"+nspec.getName()+" response: "+e.getResponse());
        result = false;
      } catch ( ParseException | IOException e ) {
        System.out.println("TestDAOSecurityTest-"+nspec.getName()+" message: "+e.getMessage());
        result = false;
      }

      test(result, "DAO " + nspec.getName() + " " + command + " rejected unauthorized request");
    }
  }
}
