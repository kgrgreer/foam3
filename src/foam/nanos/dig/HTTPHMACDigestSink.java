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

import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.lib.Outputter;
import foam.lib.json.OutputterMode;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.PropertyPredicate;
import foam.nanos.http.Format;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletResponse;

/**
 * Generate HMAC Digest
 * @see https://commons.apache.org/proper/commons-codec/apidocs/src-html/org/apache/commons/codec/digest/HmacUtils.html
 * @see https://sorenpoulsen.com/calculate-hmac-sha256-with-java
 */
public class HTTPHMACDigestSink extends HTTPDigestSink {

  public HTTPHMACDigestSink(String url, Format format) {
    this(url, "", null, format, null, false);
  }

  public HTTPHMACDigestSink(String url, String bearerToken, DUGDigestConfig dugDigestConfig, Format format, PropertyPredicate propertyPredicate, boolean outputDefaultValues) {
    super(url, bearerToken, dugDigestConfig, format, propertyPredicate, outputDefaultValues);
  }

  protected byte[] getDigest(X x, DUGDigestConfig config, String payload)
    throws UnsupportedEncodingException {
    try {
      Mac mac = Mac.getInstance(config.getAlgorithm()); // "HmacSHA256"
      SecretKeySpec secretKeySpec = new SecretKeySpec(config.getSecretKey().getBytes(StandardCharsets.UTF_8), config.getAlgorithm()); 
      mac.init(secretKeySpec);
      return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
    } catch (UnsupportedEncodingException e) {
      ((Logger) getX().get("logger")).error("Failed digest calculation", config.getAlgorithm(), e.getMessage());
      throw e;
    }
  }
}
