/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.tx;

import foam.core.ProxyX;
import foam.core.X;
import foam.lib.json.*;
import foam.lib.parse.*;
import foam.nanos.http.Format;
import foam.nanos.http.HttpParameters;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import java.io.*;
import java.nio.CharBuffer;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;
import net.nanopay.iso20022.Pacs00800106;
import net.nanopay.iso20022.Pacs00200109;
import net.nanopay.iso20022.Pacs02800101;

public class PacsWebAgent
  implements WebAgent
{
  public PacsWebAgent() {}

  public void execute(X x) {
    Logger              logger     = (Logger) x.get("logger");
    HttpServletRequest  req        = x.get(HttpServletRequest.class);
    HttpServletResponse resp       = x.get(HttpServletResponse.class);
    HttpParameters      p          = x.get(HttpParameters.class);
    final PrintWriter   out        = x.get(PrintWriter.class);
    CharBuffer          buffer_     = CharBuffer.allocate(65535);
    String              contentType = req.getHeader("Content-Type");
    Format              format     = (Format) p.get("format");
    String              msg        = p.getParameter("msg");
    String              data       = p.getParameter("data");
    String              id         = p.getParameter("id");

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);
    PM pm = new PM(getClass(), msg == null ? "view" : msg);
    try {
      if ( SafetyUtil.isEmpty(data) ) {
        if ( SafetyUtil.isEmpty(contentType) || "application/x-www-form-urlencoded".equals(contentType) ) {
          resp.setContentType("text/html");
          out.println("<form method=post><span>Request Pacs: </span>");
          //out.println("<input id=cmdInput name=cmd type=hidden value=get ></input>");
          out.println("<span id=msgSpan><select name=msg id=msg  style=margin-left:5><option value=008>008</option><option value=028>028</option></select></span>");
          out.println("<br><br><span id=formatSpan>Format:<select name=format id=format style=margin-left:40><option value=json selected>JSON</option></select></span>");
          out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
          out.println("<br><br><button type=submit >Submit</button></form>");

          out.println();

          return;
        } else {
          resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "PUT|POST expecting data, none received.");
          return;
        }
      }

      if ( Format.JSON == format ) {

        JSONParser jsonParser = new JSONParser();
        jsonParser.setX(x);

        foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.AndPropertyPredicate(x, new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
        outputterJson.setOutputDefaultValues(true);
        outputterJson.setOutputShortNames(true);
        outputterJson.setOutputClassNames(false);

        if ( ! SafetyUtil.isEmpty(msg) ) {
          if ( "008".equals(msg) ) {
            Pacs00800106 pacs00800106 = (Pacs00800106) jsonParser.parseString(data, Pacs00800106.class);

            if ( pacs00800106 == null ) {
              String message = getParsingError(x, buffer_.toString());
              logger.error(message + ", input: " + buffer_.toString());
              resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
              return;
            }

            Pacs00200109 pacs00200109 = pacs00800106.generatePacs002Msgby008Msg();

            outputterJson.output(pacs00200109);

            out.println(outputterJson.toString());
            resp.setStatus(HttpServletResponse.SC_OK);
          } else if ( "028".equals(msg) ) {
            Pacs02800101 pacs02800101 = (Pacs02800101) jsonParser.parseString(data, Pacs02800101.class);

            if ( pacs02800101 == null ) {
              String message = getParsingError(x, data);
              logger.error(message + ", input: " + data);
              resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
              return;
            }

            Pacs00200109 pacs00200109 = pacs02800101.generatePacs002Msgby028Msg();

            outputterJson.output(pacs00200109);

            out.println(outputterJson.toString());
            resp.setStatus(HttpServletResponse.SC_OK);
          } else {
            out.println("Unsupported message type.");
          }
        } else {
          resp.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, format.toString());
        }
      }
    } catch (Throwable t) {
      out.println("Error " + t);
      out.println("<pre>");
      t.printStackTrace(out);
      out.println("</pre>");
      t.printStackTrace();
      try {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, t.toString());
      } catch ( java.io.IOException e ) {
        logger.error("Failed to send HttpServletResponse CODE", e);
      }
    } finally {
      pm.log(x);
    }
  }

  /**
   * Gets the result of a failing parsing of a buffer
   * @param buffer the buffer that failed to be parsed
   * @return the error message
   */
  protected String getParsingError(X x, String buffer) {
    Parser        parser = new foam.lib.json.ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext psx    = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    ps = eps.apply(parser, psx);
    return eps.getMessage();
  }
}
