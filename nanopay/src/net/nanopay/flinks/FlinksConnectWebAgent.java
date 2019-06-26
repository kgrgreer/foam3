package net.nanopay.flinks;

import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.lib.StoragePropertyPredicate;
import foam.nanos.app.AppConfig;
import foam.nanos.http.WebAgent;
import net.nanopay.flinks.model.FlinksAuthRequest;
import net.nanopay.flinks.model.FlinksResponse;
import org.apache.commons.io.IOUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class FlinksConnectWebAgent
    implements WebAgent
{
  public static final String FLINKS_HOST =
      "https://nanopay-api.private.fin.ag/v3/8bc4718b-3780-46d0-82fd-b217535229f1/BankingServices/Authorize";
  public static final ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {

    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  @Override
  public void execute(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");
    HttpServletRequest req = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);
    HttpURLConnection conn = null;
    BufferedWriter writer = null;
    BufferedReader reader = null;

    try {
      String loginId = req.getParameter("loginId");
      FlinksAuthRequest authRequest = new FlinksAuthRequest.Builder(x)
          .setLoginId(loginId)
          .setLanguage("en")
          .setWithTransactions(false)
          .setWithBalance(false)
          .build();

      URL url = new URL(FLINKS_HOST);
      conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("POST");
      conn.setConnectTimeout(20 * 1000);
      conn.setReadTimeout(20 * 1000);
      conn.setDoInput(true);
      conn.setDoOutput(true);
      conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");

      writer = new BufferedWriter(new OutputStreamWriter(
          conn.getOutputStream(), StandardCharsets.UTF_8));
      writer.write(new Outputter(x).setPropertyPredicate(new StoragePropertyPredicate()).stringify(authRequest));
      writer.flush();
      writer.close();

      String line = null;
      int code = conn.getResponseCode();
      StringBuilder builder = sb.get();

      reader = new BufferedReader(new InputStreamReader(
          code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream()));

      while ((line = reader.readLine()) != null) {
        builder.append(line);
      }

      JSONParser parser = x.create(JSONParser.class);
      FlinksResponse response = (FlinksResponse)
          parser.parseString(builder.toString(), FlinksResponse.class);

      builder.setLength(0);
      builder.append(config.getUrl())
          .append("service/appRedirect")
          .append("?loginId=").append(loginId)
          .append("&requestId=").append(response.getRequestId());

      resp.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
      resp.setHeader("Location", builder.toString());
    } catch (Throwable ignored) {

    } finally {
      if ( conn != null ) conn.disconnect();
      IOUtils.closeQuietly(writer);
      IOUtils.closeQuietly(reader);
    }
  }
}
