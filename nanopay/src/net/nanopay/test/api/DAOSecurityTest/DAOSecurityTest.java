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
import java.util.ArrayList;
import java.util.List;

public abstract class DAOSecurityTest extends ApiTestBase {

  private static final String USER_AGENT = "Mozilla/5.0";
  protected static final List<String> GLOBAL_IGNORES = new ArrayList<>();

  public DAOSecurityTest() {
    GLOBAL_IGNORES.add("businessTypeDAO");
    GLOBAL_IGNORES.add("canadianSanctionDAO");
    GLOBAL_IGNORES.add("countryDAO");
    GLOBAL_IGNORES.add("deprecatedCapabilityJunctionDAO");
    GLOBAL_IGNORES.add("nSpecDAO");
    GLOBAL_IGNORES.add("prerequisiteCapabilityJunctionDAO");
    GLOBAL_IGNORES.add("regionDAO");
    GLOBAL_IGNORES.add("smeBusinessRegistrationDAO");
    GLOBAL_IGNORES.add("themeDAO");
    GLOBAL_IGNORES.add("userDAO");
    GLOBAL_IGNORES.add("userUserDAO");
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
    String urlString = getBaseUrl(x) + "/service/" + dao;
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
    jso = ((JSONObject) jso).get("data");
    if ( ! (jso instanceof JSONObject) ) {
      throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }
    jso = ((JSONObject) jso).get("id");
    if (jso == null) {
      throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }

    String sid = jso.toString();

    if ( ! sid.equals("foam.nanos.auth.AuthenticationException") ) {
      throw new TestDAOFailed(response.toString(), responseCode + "/" + responseMessage);
    }

    // Successful (i.e. transaction failed with authentication exception)
    return true;
  }

  // Run the test with a list of DAOs to ignore
  public void testAllDAOs(X x, String request, String command, List<String> ignores) {
    DAO nspecDAO = (DAO) x.get("nSpecDAO");
    List nspecs = ((ArraySink) nspecDAO.where(MLang.EQ(NSpec.SERVE, true)).select(new ArraySink())).getArray();

    for (Object obj : nspecs) {
      NSpec nspec = (NSpec)obj;

      // Skip anything that is not a DAO
      if (!nspec.getName().endsWith("DAO"))
        continue;

      // Skip anything in the ignores list
      if (ignores.contains(nspec.getName()))
        continue;

      // Test the DAO
      boolean DAOFailed;
      try {
        DAOFailed = testDAO(x, nspec.getName(), request);
      } catch (TestDAOFailed | ParseException | IOException testDAOFailed) {
        DAOFailed = false;
      }
      test(DAOFailed, "DAO " + nspec.getName() + " " + command + " rejected unauthorized request");
    }
  }

  // Run an individual test for debugging
  public String testSingleDAO(X x, String request, String dao, boolean force) {
    // Skip anything that is not a DAO
    if (!dao.endsWith("DAO") && !force)
      return "Not a DAO - Skipping";

    // Test the DAO
    try {
      testDAO(x, dao, request);
    } catch (TestDAOFailed testDAOFailed) {
      return testDAOFailed.getMsgBody();
    } catch (IOException | ParseException e) {
      e.printStackTrace();
      return e.getMessage();
    }

    return "Success";
  }
}
