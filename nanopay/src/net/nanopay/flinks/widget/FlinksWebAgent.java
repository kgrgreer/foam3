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

package net.nanopay.flinks.widget;

import foam.core.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import net.nanopay.flinks.widget.drivers.*;

import java.io.PrintWriter;
import javax.servlet.http.HttpServletResponse;

// <p>Successful Response Redirect - http://intuit:8080/?loginId=2ff467b7-bcde-4346-8996-08d69b30c4d8&tag=RequestToPay&accountId=8cd3e122-4826-4e24-48c4-08d69b30caf5&institution=FlinksCapital</p>

public class FlinksWebAgent
  implements WebAgent
{
  public FlinksWebAgent() {}

  public void execute(X x) {
    HttpServletResponse resp = x.get(HttpServletResponse.class);
    HttpParameters p = x.get(HttpParameters.class);
    String tag = (String) p.get("tag");
    String loginId = (String) p.get("loginId");
    Logger logger = (Logger) x.get("logger");

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);

    try {
      if ( SafetyUtil.isEmpty(tag) ) {
        throw new FlinksException("tag required");
      }
      if (SafetyUtil.isEmpty(loginId) ) {
        throw new FlinksException("loginId required");
      }

      // Find the operation
      FlinksDriver driver = FlinksDriverFactory.create(x, tag);
      if ( driver == null ) {
        throw new FlinksException("No driver found for tag: " + tag);
      }
      driver.setLoginId((String) p.getParameter("loginId"));
      driver.setAccountId((String) p.getParameter("accountId"));
      driver.setInstitution((String) p.getParameter("institution"));
      
      // Execute the driver
      driver.execute(x);
    } catch (Throwable t) {
      logger.error(t);

      try {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, t.getMessage());
      } catch ( java.io.IOException e ) {
        logger.error("Failed to send HttpServletResponse CODE", e);
      }
    }
  }
}
