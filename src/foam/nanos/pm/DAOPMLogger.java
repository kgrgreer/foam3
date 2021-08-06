/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;

public class DAOPMLogger
  extends    ContextAwareSupport
  implements PMLogger
{
  public final static String SERVICE_NAME      = "pmLogger";
  public final static String PM_DAO_NAME       = "pmDAO";

  public DAOPMLogger() {
  }

  @Override
  public void log(PM pm) {
    if (
      // TODO: maybe an exclusion list for names in this package instead
      //       of an inclusion list for names in outside packages
      ! pm.getKey().equals("foam.dao.PMDAO") &&
      ! pm.getKey().equals("foam.dao.PipelinePMDAO") &&
      ! pm.getKey().equals("foam.nanos.auth.PMAuthService")
    ) {
      if ( pm.getKey().indexOf("PM")  != -1 ) return;
      if ( pm.getName().indexOf("PM") != -1 ) return;
      if ( pm.getKey().indexOf("pm")  != -1 ) return;
      if ( pm.getName().indexOf("pm") != -1 ) return;
      if ( pm.getName().indexOf("LogMessage") != -1 ) return;
    }

    // Candlestick
    foam.dao.DAO dao = (foam.dao.DAO) getX().get(PM_DAO_NAME);
    dao.put(pm);
  }
}
