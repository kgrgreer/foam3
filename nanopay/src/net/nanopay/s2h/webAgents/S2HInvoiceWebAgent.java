/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.s2h.model;

import net.nanopay.invoice.model.Invoice;
import foam.core.*;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import java.io.PrintWriter;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import foam.nanos.logger.Logger;
import java.nio.CharBuffer;
import foam.lib.json.*;
import foam.lib.parse.*;
import javax.servlet.ServletException;

public class S2HInvoiceWebAgent
  implements WebAgent
{
  public S2HInvoiceWebAgent() {}

  public void execute(X x) {
    HttpServletRequest req  = (HttpServletRequest) x.get(HttpServletRequest.class);
    PrintWriter        out  = (PrintWriter) x.get(PrintWriter.class);
    CharBuffer         buffer_ = CharBuffer.allocate(65535);
    String             json = req.getParameter("invoice");
    Logger             logger         = (Logger) x.get("logger");

    try {
      if ( json == null || "".equals(json) ) {

        out.println("<form><textarea rows=20 cols=120 name=invoice></textarea><br><button type=submit>Submit</button></form>");
        return;
      }

      JSONParser jsonParser = new JSONParser();
      jsonParser.setX(x);
      S2HInvoice sinv       = (S2HInvoice) jsonParser.parseString(json, S2HInvoice.class);

      if (sinv == null || "".equals(sinv)) {
        out.println("Parse Error");

        String message = getParsingError(x, buffer_.toString());
        logger.error(message + ", input: " + buffer_.toString());
        out.println(message);
        out.flush();
        return;
      }

      Invoice    inv = sinv.generateNanoInvoice();
      DAO        invoiceDAO = (DAO) x.get("invoiceDAO");

      inv = (Invoice) invoiceDAO.put(inv);

      out.println("Success");
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
