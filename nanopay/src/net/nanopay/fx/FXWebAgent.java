
package net.nanopay.fx;

import foam.core.ProxyX;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.*;
import foam.lib.parse.*;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.http.Command;
import foam.nanos.http.Format;
import foam.nanos.http.WebAgent;
import foam.nanos.http.HttpParameters;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import java.io.*;
import java.util.Date;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

        foam.lib.json.Outputter outputterJson = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.AndPropertyPredicate(x, new foam.lib.PropertyPredicate[] {new foam.lib.NetworkPropertyPredicate(), new foam.lib.PermissionedPropertyPredicate()}));
        outputterJson.setOutputDefaultValues(true);
        outputterJson.setOutputClassNames(false);

        User user = ((Subject) x.get("subject")).getUser();
        final ExchangeRateQuote quote = new ExchangeRateQuote();
        if ( "getFXRate".equals(serviceKey) ) {
          GetFXQuote getFXQuote = (GetFXQuote) jsonParser.parseString(data, GetFXQuote.class);
          if ( getFXQuote == null ) {
            String message = getParsingError(x, data);
            logger.error(message + ", input: " + data);
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
            return;
          }

          if ( getFXQuote.getSourceAmount() > 0 ) {
            FXService fxService = CurrencyFXService.getFXService(x, getFXQuote.getSourceCurrency(),
                  getFXQuote.getTargetCurrency(), user.getSpid());
            FXQuote fxQuote = fxService.getFXRate(getFXQuote.getSourceCurrency(), getFXQuote.getTargetCurrency(),
                getFXQuote.getSourceAmount(), getFXQuote.getTargetAmount(), getFXQuote.getFxDirection(), getFXQuote.getValueDate(), 0, null);

            if ( null != fxQuote ) {
              final ExchangeRateFields reqExRate = new ExchangeRateFields();
              final FeesFields reqFee = new FeesFields();
              final DeliveryTimeFields reqDlvrTime = new DeliveryTimeFields();

              quote.setCode("200");
              reqExRate.setSourceCurrency(fxQuote.getSourceCurrency());
              reqExRate.setTargetCurrency(fxQuote.getTargetCurrency());
              reqExRate.setDealReferenceNumber(fxQuote.getExternalId());
              reqExRate.setFxStatus(fxQuote.getStatus());
              reqExRate.setRate(fxQuote.getRate());
              reqExRate.setExpirationTime(fxQuote.getExpiryTime());
              reqExRate.setTargetAmount(fxQuote.getTargetAmount());
              reqExRate.setSourceAmount(fxQuote.getSourceAmount());
              reqFee.setTotalFees(fxQuote.getFee());
              reqFee.setTotalFeesCurrency(fxQuote.getFeeCurrency());
              reqDlvrTime.setProcessDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24)));
              quote.setId(String.valueOf(fxQuote.getId()));
              quote.setFee(reqFee);
              quote.setExchangeRate(reqExRate);

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
            FXAccepted fxAccepted  = new FXAccepted.Builder(x).build();
            DAO fxQuoteDAO = (DAO) x.get("fxQuoteDAO");
            FXQuote existingFXQuote = (FXQuote) fxQuoteDAO.find(acceptFXRate.getId());
            if ( null != existingFXQuote ) {
              FXService fxService = CurrencyFXService.getFXService(x, existingFXQuote.getSourceCurrency(),
                  existingFXQuote.getTargetCurrency(),user.getSpid());
              Boolean accepted = fxService.acceptFXRate(String.valueOf(existingFXQuote.getId()), 0);
              if ( accepted ) {

                existingFXQuote.setEndToEndId(acceptFXRate.getEndToEndId());
                existingFXQuote.setStatus(ExchangeRateStatus.ACCEPTED.getName());
                existingFXQuote.setUser(user.getId());
                fxQuoteDAO.put_(x, existingFXQuote);
                fxAccepted.setCode("200");
              }
              outputterJson.output(fxAccepted);
            } else {
              String message = "FX Quote not found..";
              logger.error(message);
              resp.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
              return;
            }
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
    //Parser        parser = foam.lib.json.ExprParser.instance();
    PStream ps = new StringPStream();
    ParserContext psx = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    //ps = eps.apply(parser, psx);
    return eps.getMessage();
  }

}
