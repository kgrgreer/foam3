/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import java.util.logging.*;

public class JavaHandler
  extends ConsoleHandler {

  public void publish(LogRecord record) {
    Logger logger = StdoutLogger.instance();
    int level = record.getLevel().intValue();
    if ( Level.INFO.intValue() == level ) {
      logger.info(record.getMessage());
    } else if ( Level.WARNING.intValue() == level ) {
      logger.warning(record.getMessage());
    } else if ( Level.SEVERE.intValue() == level ) {
      logger.error(record.getMessage());
    } else {
      logger.debug(record.getMessage());
    }
  }
}
