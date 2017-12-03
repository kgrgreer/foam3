/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.dig.model;

import foam.core.*;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.lib.json.*;
//import foam.lib.xml.*;
import foam.lib.parse.*;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import java.io.PrintWriter;
import java.nio.CharBuffer;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.ServletException;
import foam.core.PropertyInfo;
import java.util.List;
import java.io.StringReader;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;
import java.util.Iterator;
import foam.dao.AbstractSink;
import foam.nanos.boot.NSpec;

public class DigWebAgent
  implements WebAgent
{
  public DigWebAgent() {}

  public void execute(X x) {
    HttpServletRequest req      = (HttpServletRequest) x.get(HttpServletRequest.class);
    final PrintWriter  out      = (PrintWriter) x.get(PrintWriter.class);
    CharBuffer         buffer_  = CharBuffer.allocate(65535);
    String             data     = req.getParameter("data");
    String             daoName  = req.getParameter("dao");
    String             command  = req.getParameter("cmd");
    String             format   = req.getParameter("format");
    String             id       = req.getParameter("id");
    Logger             logger   = (Logger) x.get("logger");
    DAO                nSpecDAO = (DAO) x.get("nSpecDAO");

    if ( command == null || "".equals(command) ) command = "put";

    if ( format == null  ) format = "json";

    try {

      if ( "put".equals(command) && ( data == null || "".equals(data) ) ) {
        out.println("<form><span>DAO:</span>");
        out.println("<span><select name=dao style=margin-left:35>");

        nSpecDAO.orderBy(NSpec.NAME).select(new AbstractSink() {
          public void put(FObject o, Detachable d) {
            NSpec s = (NSpec) o;
            if ( s.getServe() && s.getName().endsWith("DAO") ) {
              out.println("<option value=" + s.getName() + ">" + s.getName() + "</option>");
            }
          }
        });

        out.println("</select></span>");
        out.println("<br><br><span id=formatSpan>Format:<select name=format style=margin-left:25><option value=csv>CSV</option><option value=xml>XML</option><option value=json selected>JSON</option><option value=html>HTML</option></select></span>");
        out.println("<br><br><span>Command:<select name=cmd width=150 style=margin-left:5  onchange=changeCmd(this.value)><option value=put selected>PUT</option><option value=select>SELECT</option><option value=remove>REMOVE</option><option value=help>HELP</option></select></span>");
        out.println("<br><br><span id=idSpan style=display:none;>ID:<input name=id style=margin-left:55></input></span><br>");
        out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span><br>");
        out.println("<br><br><button type=submit>Submit</button></form>");
        out.println("<script>function changeCmd(cmdValue) { if ( cmdValue != 'put' ) {document.getElementById('dataSpan').style.cssText = 'display: none'; } else { document.getElementById('dataSpan').style.cssText = 'display: inline-block'; } if ( cmdValue == 'remove' ) { document.getElementById('idSpan').style.cssText = 'display: inline-block'; document.getElementById('formatSpan').style.cssText = 'display:none';} else { document.getElementById('idSpan').style.cssText = 'display: none'; document.getElementById('formatSpan').style.cssText = 'display: inline-block';} }</script>");

        return;
      }

      if ( daoName == null || "".equals(daoName) ) {
        throw new RuntimeException("Input DaoName");
      }

      DAO          dao      = (DAO) x.get(daoName);

      if ( dao == null ) {
        throw new RuntimeException("DAO not found");
      }

      FObject      obj      = null;
      ClassInfo    cInfo    = dao.getOf();
      Class        objClass = cInfo.getObjClass();

      if ( "put".equals(command) ) {
        if ( "json".equals(format) ) {
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);

          String dataArray[] = data.split("},");

          for (int i=0; i < dataArray.length; i++) {
            data = dataArray[i] + "}";
            System.out.println("data : " + data);
            obj = jsonParser.parseString(data, objClass);

            if ( obj == null || "".equals(obj) ) {
              out.println("Parse Error : ");

              String message = getParsingError(x, buffer_.toString());
              logger.error(message + ", input: " + buffer_.toString());
              out.println(message);
              out.flush();
              return;
            }

            obj = dao.put(obj);
          }
        } else if ( "xml".equals(format) ) {
          XMLSupport xmlSupport = new XMLSupport();
          XMLInputFactory factory = XMLInputFactory.newInstance();
          StringReader reader = new StringReader(data);
          XMLStreamReader xmlReader = factory.createXMLStreamReader(reader);

          List<FObject> objList = xmlSupport.fromXML(x, xmlReader, objClass);

          Iterator i = objList.iterator();
          while ( i.hasNext() ) {
            obj = (FObject)i.next();
            obj = dao.put(obj);
          }
        } /*else if ( "csv".equals(format) ) {
          FObject csvParser = x.create(foam.lib.csv.CSVParser);
          System.out.println("csvParser : " + csvParser);
          //csvParser.setX(x);
          //obj = requestContext.create(foam.lib.parse.JSONParser.class).parseString(message);
       }*/


        //obj = dao.put(obj);

        out.println("Success");
      } else if ( "select".equals(command) ) {
        ArraySink sink = (ArraySink) dao.select(new ArraySink());
        System.err.println("objects selected: " + sink.getArray().size());

        out.println("Select: <br><br>");

        if ( "json".equals(format) ) {
          Outputter outputterJson = new foam.lib.json.Outputter();
          outputterJson.output(sink.getArray().toArray());
          out.println(outputterJson.toString());
        } else if ( "xml".equals(format) ) {
          XMLSupport xmlSupport = new XMLSupport();
          out.println("<textarea style=\"width:800;height:800;\">");
          out.println(xmlSupport.toXMLString(sink.getArray()));
          out.println("</textarea>");
        }
      } else if ( "help".equals(command) ) {
        out.println("Help: <br><br>" );
        List<PropertyInfo> props = cInfo.getAxiomsByClass(PropertyInfo.class);

        out.println("<table>");
        for( PropertyInfo pi : props ) {
          out.println("<tr>");
          out.println("<td width=200>" + pi.getName() + "</td>");
          out.println("<td width=200>" + pi.getValueClass().getSimpleName() + "</td>");
          out.println("</tr>");
        }
        out.println("</table>");
      } else if ( "remove".equals(command) ) {
        if ( dao == null ) {
          throw new RuntimeException("Dao not found");
        } else if ( dao.find(id) == null ) {
          throw new RuntimeException("Wrong ID");
        } else if ( id == null || "".equals(id) ) {
          throw new RuntimeException("Input ID");
        } else {
          dao.remove_(x, dao.find(id));
          out.println("Success");
        }
      } else {
        out.println("Unknown command: " + command);
      }
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
    Parser        parser = new ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext psx    = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    ps = eps.apply(parser, psx);
    return eps.getMessage();
  }
}
