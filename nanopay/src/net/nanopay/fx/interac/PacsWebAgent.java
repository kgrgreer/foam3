/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.fx.interac;

import foam.core.*;
import foam.core.PropertyInfo;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.json.*;
import foam.lib.parse.*;
import foam.nanos.boot.NSpec;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import java.io.*;
import java.nio.CharBuffer;
import java.util.*;
import java.util.Iterator;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;
import net.nanopay.iso20022.Pacs00800106;
import net.nanopay.iso20022.Pacs00200109;
import net.nanopay.iso20022.Pacs02800101;

public class PacsWebAgent
  implements WebAgent
{
  public PacsWebAgent() {}

  public void execute(X x) {
    HttpServletRequest  req        = x.get(HttpServletRequest.class);
    HttpServletResponse response   = x.get(HttpServletResponse.class);
    final PrintWriter   out        = x.get(PrintWriter.class);
    CharBuffer          buffer_    = CharBuffer.allocate(65535);
    String              data       = req.getParameter("data");
    String              format     = req.getParameter("format");
    String              id         = req.getParameter("id");
    String              msg        = req.getParameter("msg");
    Logger              logger     = (Logger) x.get("logger");

    if ( format == null  ) format = "json";

    try {

      if ( SafetyUtil.isEmpty(data) ) {
        out.print("<form method=post><span>Request Pacs: </span>");
        out.println("<span id=msgSpan><select name=msg id=msg  style=margin-left:5><option value=008>008</option><option value=028>028</option></select></span>");
        out.println("<br><br><span id=formatSpan>Format:<select name=format id=format style=margin-left:40><option value=json selected>JSON</option></select></span>");
        out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
        out.println("<br><br><button type=submit >Submit</button></form>");

        out.println();

        return;
      }

      if ( "json".equals(format) ) {

        JSONParser jsonParser = new JSONParser();
        jsonParser.setX(x);

        foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
        outputterJson.setOutputDefaultValues(true);
        outputterJson.setOutputClassNames(false);

        if ( "008".equals(msg) ) {
          //PacsModel008 pacsModel008 = (PacsModel008) jsonParser.parseString(data, PacsModel008.class);
          Pacs00800106 pacs00800106 = (Pacs00800106) jsonParser.parseString(data, Pacs00800106.class);

          if ( pacs00800106 == null || "".equals(pacs00800106) ) {
            out.println("Parse Error. Please input the exact data. <br><br>");

            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());
            out.println(message);
            out.flush();
            return;
          }

          Pacs00200109 pacs00200109 = pacs00800106.generatePacs002Msgby008Msg();

          outputterJson.output(pacs00200109);
        } else {
          Pacs02800101 pacs02800101 = (Pacs02800101) jsonParser.parseString(data, Pacs02800101.class);

          if ( pacs02800101 == null || "".equals(pacs02800101) ) {
            out.println("Parse Error. Please input the exact data. <br><br>");

            String message = getParsingError(x, buffer_.toString());
            logger.error(message + ", input: " + buffer_.toString());
            out.println(message);
            out.flush();
            return;
          }

          Pacs00200109 pacs00200109 = pacs02800101.generatePacs002Msgby028Msg();

          outputterJson.output(pacs00200109);
        }

        response.setContentType("application/json");
        out.println(outputterJson.toString());
      } //else if ( "xml".equals(format) ) {
    //      XMLSupport      xmlSupport = new XMLSupport();
    //      XMLInputFactory factory    = XMLInputFactory.newInstance();
    //      StringReader    reader     = new StringReader(data);
    //      XMLStreamReader xmlReader  = factory.createXMLStreamReader(reader);
    //      List<FObject>   objList    = xmlSupport.fromXML(x, xmlReader, PacsModel008.class);
    //
    //      if ( objList.size() == 0 ) {
    //        out.println("Parse Error : ");
    //
    //        String message = getParsingError(x, buffer_.toString());
    //        logger.error(message + ", input: " + buffer_.toString());
    //        out.println(message);
    //        out.flush();
    //        return;
    //      }
    //      if ( objList.size() == 0 ) System.out.println("eeee");
    //
    //
    //      PacsModel008 pacsModel008 = null;
    //      Iterator i = objList.iterator();
    //      while ( i.hasNext() ) {
    //        pacsModel008 = (PacsModel008)i.next();
    //        PacsModel002 pacsModel002 = pacsModel008.generatePacs002Msgby008Msg();
    //        response.setContentType("application/xml");
    //        out.println(xmlSupport.toXMLString(pacsModel002));
    //      }
    //
    //      PacsModel002  pacsModel002 = pacsModel008.generatePacs002Msg();
    //      response.setContentType("application/xml");
    //      out.println(xmlSupport.toXMLString(pacsModel002));
    // }
    } catch (Throwable t) {
      out.println("Error " + t);
      out.println("<pre>");
        t.printStackTrace(out);
      out.println("</pre>");
      t.printStackTrace();
    }
  }

  /**
   * Gets the result of a failing parsing of a buffer
   * @param buffer the buffer that failed to be parsed
   * @return the error message
   */
  protected String getParsingError(X x, String buffer) {
    //Parser        parser = new foam.lib.json.ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext psx    = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    //ps = eps.apply(parser, psx);
    return eps.getMessage();
  }
}
