package nanopay.src.net.nanopay.scripts.DAOSecurityTest;

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

import static java.lang.System.exit;

public class DAOSecurityTest {

  private static final String USER_AGENT = "Mozilla/5.0";

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

  private static boolean testDAO(String dao, String request) throws ParseException, IOException, TestDAOFailed {
    String urlString = "http://localhost:8080/service/" + dao;
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
    } else {
      return true;
    }
  }

  public static String runTest(String testBody, String services, List<String> ignores) {

    File file = new File(testBody);
    FileInputStream fis;
    byte[] data;

    try {
      fis = new FileInputStream(file);
      data = new byte[(int) file.length()];
      fis.read(data);
      fis.close();
    } catch (IOException e) {
      e.printStackTrace();
      return e.getMessage();
    }

    String request = new String(data, StandardCharsets.UTF_8);

    List<String> lines = Collections.emptyList();

    try {
      lines = Files.readAllLines(Paths.get(services), StandardCharsets.UTF_8);
    } catch (IOException e) {
      e.printStackTrace();
    }

    String pattern = "p\\((.*)\\)";
    Pattern r = Pattern.compile(pattern);
    JSONParser parser = new JSONParser();

    Map<String, String> failedDAOs = new HashMap<>();

    for (String line : lines) {
        Matcher m = r.matcher(line);
        if (m.find()) {
          try {
            JSONObject jso = (JSONObject) parser.parse(m.group(1));
            Boolean serve = (Boolean) jso.get("serve");
            if ( serve != null && serve) {
              String dao = (String) jso.get("name");
              if ( ! dao.endsWith("DAO") || ignores.contains(dao) ) continue;
//              System.out.println("Testing " + dao);
              try {
//                if (testDAO(dao, request)) System.out.println(dao + " passed");
                testDAO(dao, request);
              } catch (TestDAOFailed testDAOFailed) {
//                System.out.println(dao + " failed");
//                System.out.println(dao + " response code: " + testDAOFailed.getResponse());
//                System.out.println(dao + " response body: " + testDAOFailed.getMsgBody());
                failedDAOs.put(dao, testDAOFailed.getMsgBody());
              } catch (IOException e) {
                e.printStackTrace();
                failedDAOs.put(dao, "IOException: " + e.getMessage());
              }
//              System.out.println("----------------------------------------------------------");
//              System.out.flush();
            }
          } catch (NullPointerException | ParseException e) {
            e.printStackTrace();
          }
        }
    }

    StringBuilder ret = new StringBuilder();
//    System.out.println("Failed DAOs:");
    ret.append("Failed DAOs:\n");
    for(Map.Entry<String, String> dao : failedDAOs.entrySet()) {
//      System.out.println("\t" + dao.getKey() + ": " + dao.getValue());
      ret.append(dao.getKey()).append(": ").append(dao.getValue()).append('\n');
    }
    return ret.toString();
  }

  public static String runTest(String testBody, String services) {
    List<String> ignores = new ArrayList<>();
    return runTest(testBody, services, ignores);
  }

}
