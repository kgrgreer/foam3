/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.logging.*;

public class StdoutLogger
  extends  DAOLogger
{
  protected java.util.logging.Logger logger_;
  private final static StdoutLogger instance__ = new StdoutLogger();
  public static StdoutLogger instance() { return instance__; }

  public StdoutLogger() {
    this(foam.core.XLocator.get());
  }

  public StdoutLogger(X x) {
    setX(x);
    setDelegate(
                new foam.nanos.logger.RepeatLogMessageDAO.Builder(x)
                .setDelegate(new foam.nanos.logger.LogMessageDAO.Builder(x)
                             .setDelegate(new foam.nanos.logger.StdoutLoggerDAO.Builder(x)
                                          .setDelegate(new foam.dao.NullDAO(x, foam.nanos.logger.LogMessage.getOwnClassInfo()))
                                          .build())
                             .build())
                .build());

    // Add Java logging handler
    logger_ = java.util.logging.Logger.getAnonymousLogger();
    logger_.setUseParentHandlers(false);
    logger_.setLevel(Level.ALL);
    Handler handler = new JavaHandler();
    logger_.addHandler(handler);
  }
}
