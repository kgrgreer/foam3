/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.core.X;
import foam.nanos.auth.ServiceProviderAware;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

/**
 * Support methods for Logger
 */
public class Loggers {

  /**
   * Return a PrefixLogger configured with spid, user, agent, and calling object class name
   */
  public static Logger logger(X x) {
    return logger(x, null);
  }

  public static Logger logger(X x, Object caller) {
    String spid = (String) x.get("spid");
    if ( ! SafetyUtil.isEmpty(spid) ) {
      StringBuilder sb = new StringBuilder();
      sb.append("{spid:");
      sb.append(spid);
      Subject subject = (Subject) x.get("subject");
      if ( subject != null &&
           subject.getRealUser() != null ) {
        sb.append(",user:");
        sb.append(subject.getRealUser().getId());
        if ( subject.isAgent() ) {
          sb.append(",agent:");
          sb.append(subject.getUser().getId());
        }
      }
      sb.append("}");
      return new PrefixLogger(
                              caller != null ?
                              new Object[] {
                                sb.toString(),
                                caller.getClass().getSimpleName() } :
                              new Object[] {
                                sb.toString()
                              },
                              (Logger) x.get("logger")
                              );
    }
    return (Logger) x.get("logger");
  }
}
