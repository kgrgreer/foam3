package net.nanopay.test.api.DAOSecurityTest;

import org.json.simple.*;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import javax.net.ssl.HttpsURLConnection;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.regex.*;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import net.nanopay.test.api.ApiTestBase;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.boot.NSpec;
import foam.util.SafetyUtil;

import static java.lang.System.exit;

public class DAOSecurityTest extends ApiTestBase {

  private static final String USER_AGENT = "Mozilla/5.0";

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

  private String getRequestString(String testBody) throws IOException {
    File file = new File(testBody);
    FileInputStream fis = new FileInputStream(file);
    byte[] data = new byte[(int) file.length()];
    fis.read(data);
    fis.close();
    return new String(data, StandardCharsets.UTF_8); 
  }

  // Run the test
  public String runTest(X x, String testBody) {
    List<String> ignores = new ArrayList<>();
    return runTest(x, testBody, ignores);
  }

  // Run the test with a list of DAOs to ignore
  public String runTest(X x, String testBody, List<String> ignores) {

    DAO nspecDAO = (DAO) x.get("nSpecDAO");
    List nspecs = ((ArraySink) nspecDAO.where(MLang.EQ(NSpec.SERVE, true)).select(new ArraySink())).getArray();

    String request;
    try {
      request = getRequestString(testBody);
    } catch (IOException e) {
      e.printStackTrace();
      return e.getMessage();
    }

    Map<String, String> failedDAOs = new HashMap<>();

    for (Object obj : nspecs) {
        NSpec nspec = (NSpec)obj;
        
        // Skip anything that is not a DAO
        if (!nspec.getName().endsWith("DAO"))
          continue;

        // Skip anything in the ignores list
        if (ignores.contains(nspec.getName()))
          continue;
        
        // Test the DAO
        try
        {
          testDAO(x, nspec.getName(), request);
        }
        catch (TestDAOFailed testDAOFailed) {
          failedDAOs.put(nspec.getName(), testDAOFailed.getMsgBody());
        } catch (IOException e) {
          e.printStackTrace();
          failedDAOs.put(nspec.getName(), "IOException: " + e.getMessage());
        } catch (ParseException e) {
          e.printStackTrace();
          failedDAOs.put(nspec.getName(), "ParseException: " + e.getMessage());
        }
    }

    StringBuilder ret = new StringBuilder();
    ret.append("Failed DAOs:\n");
    for(Map.Entry<String, String> dao : failedDAOs.entrySet()) {
      ret.append(dao.getKey()).append(": ").append(dao.getValue()).append('\n');
    }
    return ret.toString();
  }

  // Run an individual test for debugging
  public String runIndividualTest(X x, String testBody, String dao, boolean force)
  {
    String request;
    try {
      request = getRequestString(testBody);
    } catch (IOException e) {
      e.printStackTrace();
      return e.getMessage();
    }

    // Skip anything that is not a DAO
    if (!dao.endsWith("DAO") && !force)
      return "Not a DAO - Skipping";
  
    // Test the DAO
    try
    {
      testDAO(x, dao, request);
    }
    catch (TestDAOFailed testDAOFailed) {
      return testDAOFailed.getMsgBody();
    } catch (IOException e) {
      e.printStackTrace();
      return e.getMessage();
    } catch (ParseException e) {
      e.printStackTrace();
      return e.getMessage();
    }

    return "Success";
  }
}
