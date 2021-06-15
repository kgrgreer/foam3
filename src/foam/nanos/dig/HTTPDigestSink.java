package foam.nanos.dig;

import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.Outputter;
import foam.lib.json.OutputterMode;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.PropertyPredicate;
import foam.nanos.http.Format;
import foam.util.SafetyUtil;

import java.security.MessageDigest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HTTPDigestSink extends AbstractSink {

  protected String url_;
  protected String bearerToken_;
  protected DUGDigestConfig dugDigestConfig_;
  protected Format format_;
  protected PropertyPredicate propertyPredicate_;
  protected boolean outputDefaultValues_;

  public HTTPDigestSink(String url, Format format) {
    this(url, "", null, format, null, false);
  }

  public HTTPDigestSink(String url, String bearerToken, DUGDigestConfig dugDigestConfig, Format format, PropertyPredicate propertyPredicate, boolean outputDefaultValues) {
    url_ = url;
    bearerToken_ = bearerToken;
    dugDigestConfig_ = dugDigestConfig;
    format_ = format;
    propertyPredicate_ = propertyPredicate;
    outputDefaultValues_ = outputDefaultValues;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    HttpURLConnection conn = null;
    try {
      Outputter outputter = null;
      conn = (HttpURLConnection) new URL(url_).openConnection();
      conn.setRequestMethod("POST");
      if ( ! SafetyUtil.isEmpty(bearerToken_) ) {
        conn.setRequestProperty("Authorization", "Bearer " + bearerToken_);
      }
      
      conn.setDoInput(true);
      conn.setDoOutput(true);
      if ( format_ == Format.JSON ) {
        outputter = 
          propertyPredicate_ == null ?
          new foam.lib.json.Outputter(getX()).setOutputDefaultValues(outputDefaultValues_).setPropertyPredicate(new NetworkPropertyPredicate()) :
          new foam.lib.json.Outputter(getX()).setOutputDefaultValues(outputDefaultValues_).setPropertyPredicate(propertyPredicate_);
        conn.addRequestProperty("Accept", "application/json");
        conn.addRequestProperty("Content-Type", "application/json");
      } else if ( format_ == Format.XML ) {
        outputter = new foam.lib.xml.Outputter(OutputterMode.NETWORK);
        conn.addRequestProperty("Accept", "application/xml");
        conn.addRequestProperty("Content-Type", "application/xml");
      }
      // add hashed payload-digest to request headers
      String payload = outputter.stringify((FObject) obj);
      MessageDigest md = MessageDigest.getInstance(dugDigestConfig_.getAlgorithm());
      md.update(dugDigestConfig_.getSecretKey().getBytes(StandardCharsets.UTF_8));
      md.update(payload.getBytes(StandardCharsets.UTF_8));
      String hash = byte2Hex(md.digest());
      conn.addRequestProperty("payload-digest", hash);
      
      conn.connect();

      try (OutputStream os = conn.getOutputStream()) {
        try(BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8))) {
          writer.write(outputter.stringify((FObject)obj));
          writer.flush();
        }
      }

      // check response code
      int code = conn.getResponseCode();
      if ( code != HttpServletResponse.SC_OK ) {
        throw new RuntimeException("Http server did not return 200.");
      }
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      if ( conn != null ) {
        conn.disconnect();
      }
    }
  }

  private String byte2Hex(byte[] bytes) {
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
}
