/**
 * @license Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package net.nanopay.fx;

import foam.core.ProxyX;
import foam.core.X;
import foam.dao.DAO;
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
import net.nanopay.tx.PlanTransaction;
import net.nanopay.tx.PlanTransactionDAO;
import net.nanopay.tx.QuoteTransaction;
import net.nanopay.tx.QuoteTransactionDAO;
import net.nanopay.tx.model.Transaction;

public class FXWebAgent
        implements WebAgent {

    public FXWebAgent() {
    }

    public void execute(X x) {
        Logger logger             =   (Logger) x.get("logger");
        HttpServletRequest req    =   x.get(HttpServletRequest.class);
        HttpServletResponse resp  =   x.get(HttpServletResponse.class);
        HttpParameters p          =   x.get(HttpParameters.class);
        final PrintWriter out     =   x.get(PrintWriter.class);
        String contentType        =   req.getHeader("Content-Type");
        Command command           =   (Command) p.get("cmd");
        Format format             =   (Format) p.get("format");
        String msg                =   p.getParameter("msg");
        String data               =   p.getParameter("data");
        String id                 =   p.getParameter("id");
        String serviceKey         =   req.getParameter("serviceKey");

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


            if ( Format.JSON == format ) {
                JSONParser jsonParser = new JSONParser();
                jsonParser.setX(x);

                foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(OutputterMode.NETWORK);
                outputterJson.setOutputDefaultValues(true);
                outputterJson.setOutputClassNames(false);

                ExchangeRateQuote fxQuote = new ExchangeRateQuote.Builder(x).build();
                if ( "getFXRate".equals(serviceKey) ) {
                    GetFXQuote getFXQuote = (GetFXQuote) jsonParser.parseString(data, GetFXQuote.class);
                    if ( getFXQuote == null ) {
                        String message = getParsingError(x, data);
                        logger.error(message + ", input: " + data);
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
                        return;
                    }

                    if ( getFXQuote.getSourceAmount() > 0 ) {

                        QuoteTransaction quote = new QuoteTransaction.Builder(x).build();
                        quote.setAmount(Double.valueOf(getFXQuote.getSourceAmount()).longValue());
                        quote.setSourceCurrency(getFXQuote.getSourceCurrency());
                        quote.setDestinationCurrency(getFXQuote.getTargetCurrency());
                        

                        DAO quoteDAO = new QuoteTransactionDAO.Builder(x).build();
                        QuoteTransaction quoteTransaction = (QuoteTransaction) quoteDAO.put_(x, quote);
                        fxQuote.setId(quoteTransaction.getId());
                        PlanTransaction plan = (PlanTransaction) quoteTransaction.getPlan();
                        if( null != plan){
                            for ( Transaction transaction : plan.transactions() ) {
                                if ( transaction instanceof FXTransaction ) {
                                    FXTransaction fxTransaction = (FXTransaction) transaction;
                                    fxQuote.setStatus(fxTransaction.getFxStatus());
                                    fxQuote.setFee(fxTransaction.getFxFees());
                                    ExchangeRateFields fxRate = new ExchangeRateFields.Builder(x).build();
                                    fxRate.setRate(fxTransaction.getFxRate());
                                    fxRate.setExpirationTime(fxTransaction.getFxExpiry());
                                    fxRate.setFxStatus(fxTransaction.getFxStatus().getName());
                                    fxRate.setSourceCurrency(fxTransaction.getSourceCurrency());
                                    fxRate.setSourceAmount(fxTransaction.getAmount());
                                    fxRate.setTargetCurrency(fxTransaction.getDestinationCurrency());
                                    fxQuote.setExchangeRate(fxRate);
                                    break;
                                }
                            }
                        }

                        outputterJson.output(fxQuote);
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
                        QuoteTransaction quote = new QuoteTransaction.Builder(x).build();
                        quote.setId(acceptFXRate.getId());

                        DAO quoteDAO = new QuoteTransactionDAO.Builder(x).build();
                        QuoteTransaction quoteTransaction  = (QuoteTransaction) quoteDAO.find_(x, acceptFXRate.getId());
                        Transaction planTransaction = (Transaction) new PlanTransactionDAO.Builder(x).build().put_(x, quoteTransaction.getPlan());
                        

                        FXAccepted fxAccepted = new FXAccepted();
                        fxAccepted.setCode("200");
                        fxAccepted.setId(quoteTransaction.getId());
                        outputterJson.output(fxAccepted);
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
