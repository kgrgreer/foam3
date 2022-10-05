/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

package foam.nanos.dig;

import static foam.mlang.MLang.EQ;

import java.io.BufferedWriter;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.SocketException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.security.MessageDigest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletResponse;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.Outputter;
import foam.lib.PropertyPredicate;
import foam.lib.json.OutputterMode;
import foam.log.LogLevel;
import foam.nanos.alarming.Alarm;
import foam.nanos.http.Format;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

public class HTTPDigestSink extends AbstractSink {

  protected String url_;
  protected String bearerToken_;
  protected DUGDigestConfig dugDigestConfig_;
  protected Format format_;
  protected PropertyPredicate propertyPredicate_;
  protected boolean outputDefaultValues_;
  protected boolean removeWhitespacesInPayloadDigest_;

  private static final ThreadLocal<Outputter> outputter = new ThreadLocal<>();

  public HTTPDigestSink(String url, Format format) {
    this(url, "", null, format, null, false, false);
  }

  public HTTPDigestSink(String url, String bearerToken, DUGDigestConfig dugDigestConfig, Format format, PropertyPredicate propertyPredicate, boolean outputDefaultValues, boolean removeWhitespacesInPayloadDigest) {
    url_ = url;
    bearerToken_ = bearerToken;
    dugDigestConfig_ = dugDigestConfig;
    format_ = format;
    propertyPredicate_ = propertyPredicate;
    outputDefaultValues_ = outputDefaultValues;
    removeWhitespacesInPayloadDigest_ = removeWhitespacesInPayloadDigest;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    FObject fobj = (FObject) obj;
    Object id = fobj.getProperty("id");
    String className = fobj.getClass().getSimpleName();

    try {
      int responseCode = sendRequest(fobj);

      if ( responseCode == HttpServletResponse.SC_OK ) return;

      if ( responseCode == HttpServletResponse.SC_BAD_REQUEST ) { // client error
        String name = "HTTP DIGEST 400 RESPONSE";
        String note = "[" + id + ", " + className + ", " + new Date() + "]";
        createAlarm(name, note, LogLevel.WARN);

      } else if ( responseCode == HttpServletResponse.SC_INTERNAL_SERVER_ERROR )  { // server error
        try {
          Thread.sleep(5000);
        } catch (InterruptedException e) {}

        // make a new request
        responseCode = sendRequest(fobj);

        if ( responseCode == HttpServletResponse.SC_OK ) return;

        if ( responseCode == HttpServletResponse.SC_INTERNAL_SERVER_ERROR ) {
          String name = "HTTP DIGEST 500 RESPONSE";
          String note = "[" + id + ", " + className + ", " + new Date() + "]";
          createAlarm(name, note, LogLevel.WARN);
        }

      } else if ( responseCode == HttpServletResponse.SC_GATEWAY_TIMEOUT ) {
        String name = "HTTP DIGEST 504 RESPONSE";
        String note = "[" + id + ", " + className + ", " + new Date() + "]";
        createAlarm(name, note, LogLevel.WARN);
      }

      throw new RuntimeException(this.getClass().getSimpleName() + ", HTTP POST request failed with " + responseCode);

    } catch (SocketException e) {
      // create an alarm on connection timeout
      String name = "HTTP DIGEST CONNECTION TIMEOUT";
      String note = "[" + id + ", " + className + ", " + new Date() + "]";
      createAlarm(name, note, LogLevel.WARN);

      throw new RuntimeException(e);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  private int sendRequest(Object obj) throws Exception {
    HttpURLConnection conn = null;
    try {
      conn = (HttpURLConnection) new URL(url_).openConnection();
      conn.setRequestMethod("POST");
      if ( ! SafetyUtil.isEmpty(bearerToken_) ) {
        conn.setRequestProperty("Authorization", "Bearer " + bearerToken_);
      }

      conn.setDoInput(true);
      conn.setDoOutput(true);
      if ( format_ == Format.JSON ) {
        outputter.set(
          propertyPredicate_ == null ?
            new foam.lib.json.Outputter(getX()).setOutputDefaultValues(outputDefaultValues_).setPropertyPredicate(new NetworkPropertyPredicate()) :
            new foam.lib.json.Outputter(getX()).setOutputDefaultValues(outputDefaultValues_).setPropertyPredicate(propertyPredicate_)
        );
        conn.addRequestProperty("Accept", "application/json");
        conn.addRequestProperty("Content-Type", "application/json");
      } else if ( format_ == Format.XML ) {
        outputter.set(new foam.lib.xml.Outputter(OutputterMode.NETWORK));
        conn.addRequestProperty("Accept", "application/xml");
        conn.addRequestProperty("Content-Type", "application/xml");
      } else {
        throw new RuntimeException(this.getClass().getSimpleName() + ", Unsupported content format");
      }
      // add hashed payload-digest to request headers
      FObject fobj = (FObject) obj;
      String payload = outputter.get().stringify(fobj);
      String digest = getDigest(getX(), dugDigestConfig_, payload);
      conn.addRequestProperty("payload-digest", digest);

      setCustomConnectionProperties(fobj, conn);
      conn.connect();

      try (OutputStream os = conn.getOutputStream()) {
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8))) {
          writer.write(payload);
          writer.flush();
        }
      }
      ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "Sent DUG webhook with digest", url_, payload, digest, conn.getResponseCode());

      return conn.getResponseCode();
    } finally {
      if ( conn != null ) {
        conn.disconnect();
      }
    }
  }

  public void createAlarm(String name, String note, LogLevel severity) {
    DAO alarmDAO = (DAO) getX().get("alarmDAO");
    Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, name));
    if ( alarm == null ) {
      alarm = new Alarm.Builder(getX())
        .setName(name)
        .setSeverity(LogLevel.ERROR)
        .setNote(note)
        .build();
    } else {
      alarm.setNote(alarm.getNote() + "\n" + note);
    }
    alarmDAO.put(alarm);
  }

  protected String byte2Hex(byte[] bytes) {
    StringBuffer stringBuffer = new StringBuffer();
    String temp = null;
    for ( int i=0; i<bytes.length; i++ ) {
      temp = Integer.toHexString(bytes[i] & 0xFF);
      if ( temp.length() == 1 ) {
        stringBuffer.append("0");
      }
      stringBuffer.append(temp);
    }
    return stringBuffer.toString();
  }

  protected String getDigest(X x, DUGDigestConfig config, String payload)
    throws Exception {
    try {
      if (removeWhitespacesInPayloadDigest_)
        payload = payload.replaceAll("\\s", "");

      if ( config.getAlgorithm().toLowerCase().startsWith("hmac") ) {
        // Generate HMAC Digest
        // @see https://commons.apache.org/proper/commons-codec/apidocs/src-html/org/apache/commons/codec/digest/HmacUtils.html
        // @see https://sorenpoulsen.com/calculate-hmac-sha256-with-java
        Mac mac = Mac.getInstance(config.getAlgorithm()); // "HmacSHA256"
        SecretKeySpec secretKeySpec = new SecretKeySpec(config.getSecretKey().getBytes(StandardCharsets.UTF_8), config.getAlgorithm());
        mac.init(secretKeySpec);
        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return byte2Hex(digest);
      }

      MessageDigest md = MessageDigest.getInstance(config.getAlgorithm());
      md.update(config.getSecretKey().getBytes(StandardCharsets.UTF_8));
      md.update(payload.getBytes(StandardCharsets.UTF_8));
      return byte2Hex(md.digest());
    } catch (Exception e) {
      ((Logger) x.get("logger")).error(this.getClass().getSimpleName(), "Failed digest calculation", config.getAlgorithm(), e.getMessage());
      throw e;
    }
  }

  protected void setCustomConnectionProperties(FObject fobj, HttpURLConnection conn) {}
}
