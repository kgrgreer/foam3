/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.core.X;

/**
 * Support methods for Logger
 */
public class Loggers {

  public static Logger logger(X x) {
    return logger(x, null, false);
  }

  public static Logger logger(X x, Object caller) {
    return logger(x, caller, false);
  }

  public static Logger logger(X x, boolean includeSubject) {
    return logger(x, null, includeSubject);
  }

  /**
   * Return a composition of SubjectLogger and PrefixLogger
   * configured with spid, user, agent, and calling object class name
   */
  public static Logger logger(X x, Object caller, boolean includeSubject) {
    Logger logger = (Logger) x.get("logger");
    if ( logger == null ) {
      logger = new StdoutLogger(x);
    }
    if ( caller != null ) {
      logger = new PrefixLogger(
                                new Object[] {
                                  caller.getClass().getSimpleName()
                                },
                                logger
                                );
    }
    if ( includeSubject ) {
      logger = new SubjectLogger(x, logger);
    }

    return logger;
  }

  /**
   * For expensive debug output - where parameters may be expanded during the call to the logger, first wrap in a test if the debug logging is enabled.
   */
  public static boolean isEnabled(X x, foam.log.LogLevel level) {
    LogLevelFilterLogger filter = (LogLevelFilterLogger) x.get("logLevelFilterLogger");
    return filter.isEnabled(level);
  }

  public static boolean isDebugEnabled(X x) {
    return isEnabled(x, foam.log.LogLevel.DEBUG);
  }
}
