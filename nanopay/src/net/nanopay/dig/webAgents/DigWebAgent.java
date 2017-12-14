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
import foam.lib.csv.*;
import foam.lib.html.*;
import foam.lib.parse.*;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import java.nio.CharBuffer;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.ServletException;
import foam.core.PropertyInfo;
import java.util.*;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamReader;
import java.util.Iterator;
import foam.dao.AbstractSink;
import foam.nanos.boot.NSpec;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.io.*;

public class DigWebAgent
  implements WebAgent
{
  public DigWebAgent() {}

  public void execute(X x) {
    HttpServletRequest req        = (HttpServletRequest) x.get(HttpServletRequest.class);
    final PrintWriter  out        = (PrintWriter) x.get(PrintWriter.class);
    CharBuffer         buffer_    = CharBuffer.allocate(65535);
    String             data       = req.getParameter("data");
    String             daoName    = req.getParameter("dao");
    String             command    = req.getParameter("cmd");
    String             format     = req.getParameter("format");
    String             id         = req.getParameter("id");
    Logger             logger     = (Logger) x.get("logger");
    DAO                nSpecDAO   = (DAO) x.get("nSpecDAO");
    String             copiedData = "";
    String []          email      = req.getParameterValues("email");
    String             subject    = req.getParameter("subject");

    if ( command == null || "".equals(command) ) command = "put";

    if ( format == null  ) format = "json";

    try {

      if ( "put".equals(command) && ( data == null || "".equals(data) ) ) {
        out.println("<form><span>DAO:</span>");
        out.println("<span><select name=dao style=margin-left:35>");

        //gets all ongoing nanopay services
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
        out.println("<br><br><span id=emailSpan style=display:none;>Email:<input name=email style=margin-left:30;width:350></input></span>");
        out.println("<br><br><span id=subjectSpan style=display:none;>Subject:<input name=subject style=margin-left:20;width:350></input></span>");
        out.println("<br><br><span id=idSpan style=display:none;>ID:<input name=id style=margin-left:53></input></span>");
        out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
        out.println("<br><br><button type=submit onClick=performHelp()>Submit</button></form>");
        out.println("<script>function changeCmd(cmdValue) { if ( cmdValue != 'put' ) {document.getElementById('dataSpan').style.cssText = 'display: none'; } else { document.getElementById('dataSpan').style.cssText = 'display: inline-block'; } if ( cmdValue == 'remove' ) { document.getElementById('idSpan').style.cssText = 'display: inline-block'; document.getElementById('formatSpan').style.cssText = 'display:none';} else { document.getElementById('idSpan').style.cssText = 'display: none'; document.getElementById('formatSpan').style.cssText = 'display: inline-block';} if ( cmdValue == 'select' ) {document.getElementById('emailSpan').style.cssText = 'display: inline-block'; document.getElementById('subjectSpan').style.cssText = 'display: inline-block';}else {document.getElementById('emailSpan').style.cssText = 'display:none'; document.getElementById('subjectSpan').style.cssText = 'display:none';}}</script>");

        return;
      }

      if ( daoName == null || "".equals(daoName) ) {
        throw new RuntimeException("Input DaoName");
      }

      DAO dao = (DAO) x.get(daoName);

      if ( dao == null ) {
        throw new RuntimeException("DAO not found");
      }

      FObject   obj      = null;
      ClassInfo cInfo    = dao.getOf();
      Class     objClass = cInfo.getObjClass();

      if ( "put".equals(command) ) {
        copiedData = data;

        if ( "json".equals(format) ) {
          JSONParser jsonParser = new JSONParser();
          jsonParser.setX(x);

          //let FObjectArray parse first
          Object o = null;
          o = jsonParser.parseStringForArray(data, objClass);
          if ( o != null ) {
            Object[] objs = (Object[]) o;
            for ( int j = 0 ; j < objs.length ; j++ ) {
              obj = (FObject) objs[j];
              dao.put(obj);
            }
            out.println("Success");
            return;
          }

          //copiedData = data;
          String dataArray[] = data.split("},");


          for (int i=0; i < dataArray.length; i++) {
            data = dataArray[i] + "}";
            o = jsonParser.parseString(data, objClass);

            if ( o == null ) {
              out.println("Parse Error : ");

              String message = getParsingError(x, buffer_.toString());
              logger.error(message + ", input: " + buffer_.toString());
              out.println(message);
              out.flush();
              return;
            }
            obj = (FObject) o;
            dao.put(obj);
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
        } else if ( "csv".equals(format) ) {
          CSVSupport csvSupport = new CSVSupport();
          csvSupport.setX(x);

          // convert String into InputStream
	        InputStream is = new ByteArrayInputStream(data.getBytes());

          ArraySink arraySink = new ArraySink();

          csvSupport.inputCSV(is, arraySink, cInfo);

          List list = arraySink.getArray();
          for( int i = 0 ; i < list.size() ; i++ ){
              dao.put((FObject) list.get(i));
          }
       }


        //obj = dao.put(obj);

        out.println("Success");
      } else if ( "select".equals(command) ) {
        ArraySink sink = (ArraySink) dao.select(new ArraySink());
        System.err.println("objects selected: " + sink.getArray().size());

        out.println("Select <br><br>");
        if ( "json".equals(format) ) {
          foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter();
          outputterJson.output(sink.getArray().toArray());

          if ( email.length != 0 && !email[0].equals("") && email[0] != null ) {
            output(x, outputterJson.toString());
          } else {
            out.println(outputterJson.toString());
          }
        } else if ( "xml".equals(format) ) {
          XMLSupport xmlSupport = new XMLSupport();

          if ( email.length != 0 && !email[0].equals("") && email[0] != null ) {
            output(x, xmlSupport.toXMLString(sink.getArray()));
          } else {
            out.println("<textarea style=\"width:700;height:400;\">");
            out.println(xmlSupport.toXMLString(sink.getArray()));
            out.println("</textarea>");
          }
        } else if ( "csv".equals(format) ) {
          foam.lib.csv.Outputter outputterCsv = new foam.lib.csv.Outputter();
          outputterCsv.output(sink.getArray().toArray());
          List a = sink.getArray();
          for ( int i = 0 ; i < a.size() ; i++ ) {
            outputterCsv.put((FObject) a.get(i), null);
          }

          if ( email.length != 0 && !email[0].equals("")  && email[0] != null ) {
            output(x, outputterCsv.toString());
          } else {
            out.println("<textarea style=\"width:800;height:800;\">");
            out.println(outputterCsv.toString());
            out.println("</textarea>");
          }
        } else if ( "html".equals(format) ) {
          foam.lib.html.Outputter outputterHtml = new foam.lib.html.Outputter();

          outputterHtml.outputStartHtml();
          outputterHtml.outputStartTable();
          List a = sink.getArray();
          for ( int i = 0 ; i < a.size() ; i++ ) {
            if ( i == 0 ) {
              outputterHtml.outputHead((FObject) a.get(i));
            }
            outputterHtml.put((FObject) a.get(i), null);
          }
          outputterHtml.outputEndTable();
          outputterHtml.outputEndHtml();

          if ( email.length != 0 && !email[0].equals("") && email[0] != null ) {
            output(x, outputterHtml.toString());
          } else {
            out.println("<textarea style=\"width:700;height:600;\">");
            out.println(outputterHtml.toString());
            out.println("</textarea>");
          }
        }
      } else if ( "help".equals(command) ) {
        out.println("Help: <br><br>" );
        /*List<PropertyInfo> props = cInfo.getAxiomsByClass(PropertyInfo.class);

        out.println(daoName + "<br><br>");
        out.println("<table>");
        for( PropertyInfo pi : props ) {
          out.println("<tr>");
          out.println("<td width=200>" + pi.getName() + "</td>");
          out.println("<td width=200>" + pi.getValueClass().getSimpleName() + "</td>");
          out.println("</tr>");
        }
        out.println("</table>");*/

        out.println("<input type=hidden id=classInfo style=margin-left:30;width:350 value=" + cInfo.getId() + "></input>");
        out.println("<script>var vurl = document.location.protocol + '//' + document.location.host + '/?path=' + document.getElementById('classInfo').value + '#docs'; window.open(vurl);</script>");

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

      if ( !"put".equals(command) ) {
        data = "";
      }

      if ( !"remove".equals(command) ) {
        id = "";
      }

      System.out.println("data : " + copiedData);
      out.println("<input type=hidden id=urlInfo style=margin-left:30;width:350 value=" + cInfo.getId() + "></input>");
      out.println("<br><br><br> URL : <br>");
      out.println("<textarea style=\"width:700;height:200;\">http://localhost:8080/service/digWebAgent?");
      //out.println("<script>var vurl = document.location.protocol + '//' + document.location.host + '/service/digWebAgent?=';");
      if ( daoName != null && daoName != "" ) {
        out.println("dao=" + daoName);
      }

      if ( format != null && format != "" ) {
        out.println("&format=" + format);
      }

      if ( command != null && command != "" ) {
        out.println("&cmd=" + command);
      }

      if ( id != null && id != "" ) {
        out.println("&id=" + id);
      }

      if ( data != null && data != "" ) {
        out.println("&data=" + copiedData);
      }

      if ( email.length != 0 ) {
        out.println("&email=" + email[0]);
      }

      if ( subject != null && subject != "" ) {
        out.println("&subject=" + subject.replaceAll(" ", ""));
      }

      out.println("</textarea>");
      out.println();
    } catch (Throwable t) {
      out.println("Error " + t);
      out.println("<pre>");
        t.printStackTrace(out);
      out.println("</pre>");
      t.printStackTrace();
    }
  }

  protected void output(X x, String data) {
    HttpServletRequest req     = (HttpServletRequest) x.get(HttpServletRequest.class);
    String []          email   = req.getParameterValues("email");
    String             subject = req.getParameter("subject");

    if ( email.length == 0 ) {
      PrintWriter out = (PrintWriter) x.get(PrintWriter.class);

      out.print(data);
    } else {
      EmailService emailService = (EmailService) x.get("email");
      EmailMessage message      = new EmailMessage();

      message.setFrom("info@nanopay.net");
      message.setReplyTo("noreply@nanopay.net");
      message.setTo(email);
      message.setSubject(subject);

      String newData = "<textarea style=\"width:1000;height:400;\">" + data + "</textarea>";

      message.setBody(newData);

      emailService.sendEmail(message);
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
