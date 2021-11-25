/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.dig;

import foam.core.*;
import foam.nanos.dig.drivers.*;
import foam.nanos.dig.exception.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DigWebAgent extends ContextAwareSupport
  implements WebAgent, SendErrorHandler
{
  public DigWebAgent() {}

  public void execute(X x) {
    HttpServletResponse resp    = x.get(HttpServletResponse.class);
    HttpParameters      p       = x.get(HttpParameters.class);
    Command             command = (Command) p.get(Command.class);
    Format              format  = (Format) p.get(Format.class);
    Logger              logger  = (Logger) x.get("logger");
    String              daoName = p.getParameter("dao");
    PM                  pm      = PM.create(x, true, getClass().getSimpleName(), p.getParameter("dao"), command.getName(), format.getName());

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);
    logger.debug("data", p.get("data")
    );

    try {
      // Find the operation
      DigFormatDriver driver = DigFormatDriverFactory.create(getX(), format);

      if ( driver == null ) {
        DigErrorMessage error = new ParsingErrorException("UnsupportedFormat");
        DigUtil.outputException(x, error, format);
        return;
      }

      if ( SafetyUtil.isEmpty(daoName) ) {
        DigErrorMessage error = new DAORequiredException();
        DigUtil.outputException(x, error, format);
        logger.error(error);
        return;
      }

      // Execute the command
      switch ( command ) {
        case PUT:
          driver.put(x);
          break;
        case SELECT:
          driver.select(x);
          break;
        case REMOVE:
          driver.remove(x);
          break;
      }
    } catch (DigErrorMessage dem) {
      logger.error(dem);
      DigUtil.outputException(x, dem, format);
      pm.error(x, dem.getMessage());
    } catch (FOAMException fe) {
      logger.error(fe);
      DigUtil.outputFOAMException(x, fe, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, format);
      pm.error(x, fe.getMessage());
    } catch (Throwable t) {
      logger.error(t);
      DigErrorMessage error = new GeneralException(t.getMessage());
      error.setStatus(String.valueOf(HttpServletResponse.SC_INTERNAL_SERVER_ERROR));
      error.setMoreInfo(t.getClass().getName());
      DigUtil.outputException(x, error, format);
      pm.error(x, t.getMessage());
    } finally {
      pm.log(x);
    }
  }

  public void sendError(X x, int status, String message) {
    DigErrorMessage error = new GeneralException(message);
    error.setStatus(String.valueOf(status));
    DigUtil.outputException(x, error, Format.JSON);
  }
}
