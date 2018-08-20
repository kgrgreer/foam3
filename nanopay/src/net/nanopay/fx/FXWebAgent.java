/**
 * @license Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package net.nanopay.fx;

import foam.core.ProxyX;
import foam.core.X;
import foam.lib.json.*;
import foam.lib.parse.*;
import foam.nanos.http.Command;
import foam.nanos.http.Format;
import foam.nanos.http.WebAgent;
import foam.nanos.http.HttpParameters;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import java.io.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.nanopay.account.FXService;

public class FXWebAgent
        implements WebAgent {

    public FXWebAgent() {
    }

    public void execute(X x) {
        Logger logger                       =   (Logger) x.get("logger");
        HttpServletRequest req              =   x.get(HttpServletRequest.class);
        HttpServletResponse resp            =   x.get(HttpServletResponse.class);
        HttpParameters p                    =   x.get(HttpParameters.class);
        final PrintWriter out               =   x.get(PrintWriter.class);
        String contentType                  =   req.getHeader("Content-Type");
        Command command                     =   (Command) p.get("cmd");
        Format format                       =   (Format) p.get("format");
        String msg                          =   p.getParameter("msg");
        String data                         =   p.getParameter("data");
        String id                           =   p.getParameter("id");
        String serviceKey                   =   req.getParameter("serviceKey");

        logger = new PrefixLogger(new Object[]{this.getClass().getSimpleName()}, logger);
        PM pm = new PM(getClass(), serviceKey);

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

            FXService fxService = (FXService) x.get("ascendantFXService");

            if ( Format.JSON == format ) {
                JSONParser jsonParser = new JSONParser();
                jsonParser.setX(x);

                foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
                outputterJson.setOutputDefaultValues(true);
                outputterJson.setOutputClassNames(false);

                ExchangeRateQuote exQuote;
                if ( "getFXRate".equals(serviceKey) ) {
                    GetFXQuote getFXQuote = (GetFXQuote) jsonParser.parseString(data, GetFXQuote.class);
                    if ( getFXQuote == null ) {
                        String message = getParsingError(x, data);
                        logger.error(message + ", input: " + data);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }

                    if ( getFXQuote.getTargetAmount() > 0 ) {
                        exQuote = fxService.getFXRate(getFXQuote.getSourceCurrency(), getFXQuote.getTargetCurrency(), getFXQuote.getTargetAmount(), getFXQuote.getFxDirection(), getFXQuote.getValueDate());
                        outputterJson.output(exQuote);
                    } else {
                        String message = "target amount < 0";
                        logger.error(message);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }
                }

                if ( "acceptFXRate".equals(serviceKey) ) {
                    AcceptFXRate acceptFXRate = (AcceptFXRate) jsonParser.parseString(data, AcceptFXRate.class);
                    if ( acceptFXRate == null ) {
                        String message = getParsingError(x, data);
                        logger.error(message + ", input: " + data);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }

                    if ( SafetyUtil.isEmpty(acceptFXRate.getId()) ) {
                        String message = "Quote ID is missing in request.";
                        logger.error(message);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    } else {
                        FXAccepted fxAccepted = fxService.acceptFXRate(acceptFXRate);
                        outputterJson.output(fxAccepted);
                    }
                }

               if ( "submitFXDeal".equals(serviceKey) ) {
                    SubmitFXDeal submitFXDeal = (SubmitFXDeal) jsonParser.parseString(data, SubmitFXDeal.class);
                    if (submitFXDeal == null) {
                        String message = getParsingError(x, data);
                        logger.error(message + ", input: " + data);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }

                    if ( SafetyUtil.isEmpty(submitFXDeal.getQuoteId()) ) {
                        String message = "Quote ID is missing in request.";
                        logger.error(message);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    } else {
                        FXDeal submittedDeal = fxService.submitFXDeal(submitFXDeal);
                        outputterJson.output(submittedDeal);
                    }
                }

               if ( "confirmFXDeal".equals(serviceKey) ) {
                    ConfirmFXDeal confirmFXDeal = (ConfirmFXDeal) jsonParser.parseString(data, ConfirmFXDeal.class);
                    if (confirmFXDeal == null) {
                        String message = getParsingError(x, data);
                        logger.error(message + ", input: " + data);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }

                    if ( SafetyUtil.isEmpty(confirmFXDeal.getId()) ) {
                        String message = "FX Deal ID is missing in request.";
                        logger.error(message);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    } else {
                        FXDeal fxDealConfirmation = fxService.confirmFXDeal(confirmFXDeal);
                        outputterJson.output(fxDealConfirmation);
                    }
                }

               if ( "checkIncomingFundsStatus".equals(serviceKey) ) {
                    GetIncomingFundStatus getIncomingFundStatus = (GetIncomingFundStatus) jsonParser.parseString(data, GetIncomingFundStatus.class);
                    if (getIncomingFundStatus == null) {
                        String message = getParsingError(x, data);
                        logger.error(message + ", input: " + data);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }

                    if ( SafetyUtil.isEmpty(getIncomingFundStatus.getDealId()) ) {
                        String message = "FX Deal ID is missing in request.";
                        logger.error(message);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    } else {
                        FXDeal fxFundStatus = fxService.checkIncomingFundsStatus(getIncomingFundStatus);
                        outputterJson.output(fxFundStatus);
                    }
                }

               if ( "addFXPayee".equals(serviceKey) ) {
                    FXPayee fxPayee = (FXPayee) jsonParser.parseString(data, FXPayee.class);
                    if (fxPayee == null) {
                        String message = getParsingError(x, data);
                        logger.error(message + ", input: " + data);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }

                    if ( SafetyUtil.isEmpty(fxPayee.getPayeeName()) ) {
                        String message = "Payee Name is missing in request.";
                        logger.error(message);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    } else {
                        FXPayee newFXPayee = fxService.addFXPayee(fxPayee);
                        outputterJson.output(newFXPayee);
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
            } catch (java.io.IOException e) {
                logger.error("Failed to send HttpServletResponse CODE", e);
            }
        } finally {
            pm.log(x);
        }
    }

    /**
     * Gets the result of a failing parsing of a buffer
     *
     * @param buffer the buffer that failed to be parsed
     * @return the error message
     */
    protected String getParsingError(X x, String buffer) {
        //Parser        parser = new foam.lib.json.ExprParser();
        PStream ps = new StringPStream();
        ParserContext psx = new ParserContextImpl();

        ((StringPStream) ps).setString(buffer);
        psx.set("X", x == null ? new ProxyX() : x);

        ErrorReportingPStream eps = new ErrorReportingPStream(ps);
        //ps = eps.apply(parser, psx);
        return eps.getMessage();
    }
}
