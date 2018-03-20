/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.fx.interac;

import foam.core.*;
import foam.lib.json.*;
import foam.lib.parse.*;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import java.io.*;
import java.nio.CharBuffer;
import java.util.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;
import net.nanopay.fx.interac.model.ExchangerateApiModel;
import net.nanopay.fx.model.ExchangeRateQuote;
import net.nanopay.fx.ExchangeRateService;
import net.nanopay.fx.interac.model.AcceptRateApiModel;

public class ApiWebAgent
  implements WebAgent
{
  public ApiWebAgent() {}

  public void execute(X x) {
    HttpServletRequest  req                 = x.get(HttpServletRequest.class);
    HttpServletResponse response            = x.get(HttpServletResponse.class);
    final PrintWriter   out                 = x.get(PrintWriter.class);
    CharBuffer          buffer_             = CharBuffer.allocate(65535);
    String              data                = req.getParameter("data");
    String              format              = req.getParameter("format");
    String              id                  = req.getParameter("id");
    String              msg                 = req.getParameter("msg");
    Logger              logger              = (Logger) x.get("logger");
    String              serviceKey          = req.getParameter("serviceKey");
    String              sourceCurrency      = "";
    String              targetCurrency      = "";
    double              sourceAmount        = 0.0;
    double              targetAmount        = 0.0;
    String              valueDate           = "";
    String              dealReferenceNumber = "";
    String              endToEndId          = "";

    if ( format == null  ) format = "json";

    try {

      if ( data == null || "".equals(data) ) {
        out.print("<form method=post><span>ExchangeRate Service </span>");
        out.println("<span id=serviceKeySpan><select name=serviceKey id=serviceKey  style=margin-left:5><option value=getRateFromTarget>getRateFromTarget</option><option value=getRateFromSource>getRateFromSource</option><option value=003>AcceptRate</option></select></span>");
        out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
        out.println("<br><br><button type=submit >Submit</button></form>");

        out.println();

        return;
      }

      ExchangeRateService service = (ExchangeRateService) x.get("exchangeRate");

      if ( "json".equals(format) ) {
        JSONParser jsonParser = new JSONParser();
        jsonParser.setX(x);

        foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
        outputterJson.setOutputDefaultValues(true);
        outputterJson.setOutputClassNames(false);

        ExchangerateApiModel exApiModel = (ExchangerateApiModel) jsonParser.parseString(data, ExchangerateApiModel.class);

        if ( exApiModel == null || "".equals(exApiModel) ) {
          out.println("Parse Error. Please input the exact data. <br><br>");

          String message = getParsingError(x, buffer_.toString());
          logger.error(message + ", input: " + buffer_.toString());
          out.println(message);
          out.flush();
          return;
        }

        sourceCurrency      = exApiModel.getSourceCurrency();
        targetCurrency      = exApiModel.getTargetCurrency();
        sourceAmount        = exApiModel.getSourceAmount();
        targetAmount        = exApiModel.getTargetAmount();
        valueDate           = exApiModel.getValueDate();
        dealReferenceNumber = exApiModel.getDealReferenceNumber();
        endToEndId          = exApiModel.getEndToEndId();

        ExchangeRateQuote exQuote = null;
        if ( "getRateFromTarget".equals(serviceKey) ) {
          exQuote = service.getRateFromTarget(sourceCurrency, targetCurrency, targetAmount, valueDate);
          outputterJson.output(exQuote);
        } else if ( "getRateFromSource".equals(serviceKey) ) {
          exQuote = service.getRateFromSource(sourceCurrency, targetCurrency, sourceAmount, valueDate);
          outputterJson.output(exQuote);
        } else {
          if ( sourceCurrency == null || "".equals(sourceCurrency) || targetCurrency == null || "".equals(targetCurrency) ) {
            AcceptRateApiModel accprate = service.acceptRate(endToEndId, dealReferenceNumber);
            outputterJson.output(accprate);
          } else {
            out.println("Please input the exact data");
          }
        }

        response.setContentType("application/json");
        out.println(outputterJson.toString());
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
