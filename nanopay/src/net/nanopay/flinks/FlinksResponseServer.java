/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.flinks;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import javax.servlet.http.HttpServletRequest;
import foam.core.X;
import foam.lib.StoragePropertyPredicate;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.logger.Logger;
import net.nanopay.flinks.external.FlinksLoginId;
import net.nanopay.flinks.model.FlinksAuthRequest;
import net.nanopay.flinks.model.FlinksResponse;

public class FlinksResponseServer implements FlinksResponseService {

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
  public FlinksResponse getFlinksResponse(X x, FlinksLoginId flinksLoginId) {
    HttpURLConnection conn = null;
    FlinksResponse response = null;
    Logger logger = (Logger) x.get("logger");

    try {
      FlinksAuthRequest authRequest = new FlinksAuthRequest.Builder(x)
          .setLoginId(flinksLoginId.getLoginId())
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

      try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
          conn.getOutputStream(), StandardCharsets.UTF_8))) {
        writer.write(new Outputter(x).setPropertyPredicate(new StoragePropertyPredicate()).stringify(authRequest));
        writer.flush();
      }
      String line = null;
      int code = conn.getResponseCode();
      StringBuilder builder = sb.get();

      try (BufferedReader reader = new BufferedReader(new InputStreamReader(
          code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream()))) {
        while ((line = reader.readLine()) != null) {
          builder.append(line);
        }
      }

      JSONParser parser = x.create(JSONParser.class);
      response = (FlinksResponse)
          parser.parseString(builder.toString(), FlinksResponse.class);
    } catch (Throwable throwable) {
      logger.error(throwable.getMessage(), throwable);
    } finally {
      if ( conn != null ) conn.disconnect();
      return response;
    }
  }
}
