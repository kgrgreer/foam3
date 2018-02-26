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
import net.nanopay.fx.interac.model.PacsModel008;
import net.nanopay.fx.interac.model.PacsModel002;

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
    //String              daoName    = req.getParameter("dao");
    String              command    = req.getParameter("cmd");
    String              format     = req.getParameter("format");
    String              id         = req.getParameter("id");
    Logger              logger     = (Logger) x.get("logger");

    //response.setContentType("text/html");

    if ( command == null || "".equals(command) ) command = "select";

    if ( format == null  ) format = "json";

    try {

      if ( "select".equals(command) && ( data == null || "".equals(data) ) ) {
        //out.println("<form method=post><span>DAO:</span>");
        out.println("<form method=post><span>request Pacs:</span>");

        out.println("</select></span>");
        out.println("<br><br><span id=formatSpan>Format:<select name=format id=format onchange=changeFormat() style=margin-left:25><option value=csv>CSV</option><option value=xml>XML</option><option value=json selected>JSON</option><option value=html>HTML</option><option value=jsonj>JSON/J</option></select></span>");
        out.println("<br><br><span>Command:<select name=cmd id=cmd width=150 style=margin-left:5 ><option value=put selected>PUT</option><option value=select>SELECT</option><option value=remove>REMOVE</option><option value=help>HELP</option></select></span>");
        out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
        out.println("<br><span id=urlSpan style=display:none;> URL : </span>");
        out.println("<input id=builtUrl size=120 style=margin-left:20;display:none;/ >");
        out.println("<br><br><button type=submit >Submit</button></form>");
        out.println("<script>function changeFormat() {var vbuiltUrl = document.location.protocol + '//' + document.location.host + '/service/dig?dao=' + document.getElementById('dao').value + '&format=' + document.getElementById('format').options[document.getElementById('format').selectedIndex].value + '&cmd=' + document.getElementById('cmd').options[document.getElementById('cmd').selectedIndex].value + '&email='; document.getElementById('builtUrl').value=vbuiltUrl;}</script>");

        out.println();

        return;
      }

      if ( "select".equals(command) ) {
        //ArraySink sink = (ArraySink) dao.select(new ArraySink());
        //System.err.println("objects selected: " + sink.getArray().size());

        if ( "json".equals(format) ) {
          /*foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
          outputterJson.setOutputDefaultValues(true);
          outputterJson.output(data); //sink.getArray().toArray()

          response.setContentType("application/json");

          out.println(outputterJson.toString());*/

          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);
          PacsModel008 pacsModel008 = (PacsModel008) jsonParser.parseString(data, PacsModel008.class);

        if ( pacsModel008 == null || "".equals(pacsModel008) ) {
          out.println("Parse Error");

          String message = getParsingError(x, buffer_.toString());
          logger.error(message + ", input: " + buffer_.toString());
          out.println(message);
          out.flush();
          return;
        }

        PacsModel002  pacsModel002 = pacsModel008.generatePacs002Msg();

        foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
        outputterJson.setOutputDefaultValues(true);
        outputterJson.output(pacsModel002); //sink.getArray().toArray()

        response.setContentType("application/json");

        out.println(outputterJson.toString());
      }
    }
      /*if ( daoName == null || "".equals(daoName) ) {
        throw new RuntimeException("Input DaoName");
      }

      DAO dao = (DAO) x.get(daoName);

      /*if ( dao == null ) {
        throw new RuntimeException("DAO not found");
      }

      dao = dao.inX(x);

      FObject   obj      = null;
      ClassInfo cInfo    = dao.getOf();
      Class     objClass = cInfo.getObjClass();
      */

        //out.println("Success");

    } catch (Throwable t) {
      out.println("Error " + t);
      out.println("<pre>");
        t.printStackTrace(out);
      out.println("</pre>");
      t.printStackTrace();
    }
  }

  // protected void output(X x, String data) {
  //
  //   HttpServletRequest  req     = x.get(HttpServletRequest.class);
  //   String []           email   = req.getParameterValues("email");
  //   String              subject = req.getParameter("subject");
  //
  //   if ( email.length == 0 ) {
  //     PrintWriter out = x.get(PrintWriter.class);
  //
  //     out.print(data);
  //   } else {
  //     EmailService emailService = (EmailService) x.get("email");
  //     EmailMessage message      = new EmailMessage();
  //     message.setTo(email);
  //     message.setSubject(subject);
  //
  //     String newData = data;
  //
  //     message.setBody(newData);
  //
  //     emailService.sendEmail(message);
  //   }
  // }

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
