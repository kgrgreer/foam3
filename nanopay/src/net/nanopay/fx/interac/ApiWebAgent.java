/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.fx.interac;

import foam.core.ClassInfo;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.ProxyX;
import foam.core.X;
import foam.core.XMLSupport;
import foam.lib.json.*;
import foam.lib.parse.*;
import foam.nanos.http.Command;
import foam.nanos.http.Format;
import foam.nanos.http.WebAgent;
import foam.nanos.http.HttpParameters;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
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
    Logger              logger              = (Logger) x.get("logger");
    HttpServletRequest  req                 = x.get(HttpServletRequest.class);
    HttpServletResponse resp                = x.get(HttpServletResponse.class);
    HttpParameters      p                   = x.get(HttpParameters.class);
    final PrintWriter   out                 = x.get(PrintWriter.class);
    String              contentType         = req.getHeader("Content-Type");
    Enum                command             = (Enum) p.get("cmd");
    Enum                format              = (Enum) p.get("format");
    String              msg                 = p.getParameter("msg");
    String              data                = p.getParameter("data");
    String              id                  = p.getParameter("id");
    String              serviceKey          = req.getParameter("serviceKey");
    String              sourceCurrency      = "";
    String              targetCurrency      = "";
    double              sourceAmount        = 0.0;
    double              targetAmount        = 0.0;
    String              valueDate           = "";
    String              dealReferenceNumber = "";
    String              endToEndId          = "";

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);

    try {

      if ( SafetyUtil.isEmpty(data) ) {
        if ( SafetyUtil.isEmpty(contentType) || "application/x-www-form-urlencoded".equals(contentType) ) {
          resp.setContentType("text/html");
          out.print("<form method=post><span>ExchangeRate Service </span>");
          out.println("<span id=serviceKeySpan><select name=serviceKey id=serviceKey  style=margin-left:5><option value=getRateFromTarget>getRateFromTarget</option><option value=getRateFromSource>getRateFromSource</option><option value=003>AcceptRate</option></select></span>");
          out.println("<br><br><span id=dataSpan>Data:<br><textarea rows=20 cols=120 name=data></textarea></span>");
          out.println("<br><br><button type=submit >Submit</button></form>");

          out.println();

          return;
        } else {
          resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "PUT|POST expecting data, none received.");
          return;
        }
      }

      ExchangeRateService service = (ExchangeRateService) x.get("exchangeRate");

      if ( Format.JSON == format ) {
        JSONParser jsonParser = new JSONParser();
        jsonParser.setX(x);

        foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
        outputterJson.setOutputDefaultValues(true);
        outputterJson.setOutputClassNames(false);

        ExchangerateApiModel exApiModel = (ExchangerateApiModel) jsonParser.parseString(data, ExchangerateApiModel.class);

        if ( exApiModel == null ) {
          String message = getParsingError(x, data);
          logger.error(message + ", input: " + data);
          resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
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
          if ( targetAmount > 0) {
            exQuote = service.getRateFromTarget(sourceCurrency, targetCurrency, targetAmount, valueDate);
            outputterJson.output(exQuote);
          } else {
            String message = "target amount < 0";
            logger.error(message);
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
            return;
          }
        } else if ( "getRateFromSource".equals(serviceKey) ) {
          if ( sourceAmount > 0) {
            exQuote = service.getRateFromSource(sourceCurrency, targetCurrency, sourceAmount, valueDate);
            outputterJson.output(exQuote);
          } else {
            String message = "source amount < 0";
            logger.error(message);
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
            return;
          }
        } else {
          if ( SafetyUtil.isEmpty(sourceCurrency) || SafetyUtil.isEmpty(targetCurrency) ) {
            AcceptRateApiModel accprate = service.acceptRate(endToEndId, dealReferenceNumber);
            outputterJson.output(accprate);
          } else {
            String message = "invalid source|target currency";
            logger.error(message);
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
            return;
          }
        }

        out.println(outputterJson.toString());
        resp.setStatus(HttpServletResponse.SC_OK);
      } else {
        resp.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, format.toString());
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
