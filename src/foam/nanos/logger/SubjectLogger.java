/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.core.XLocator;
import foam.core.X;
import foam.nanos.auth.ServiceProviderAware;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

/**
 * Log subject user, agent
 */
public class SubjectLogger
  extends PrefixLogger
{
  public SubjectLogger(X x, Logger delegate) {
    super(null, delegate);

    // fallback when XLocator or subject not configured.
    prefix_ = getPrefix(x);
  }

  protected Object[] prefix(Object[] args) {
    try {
      X x = XLocator.get();
      if ( x != null &&
           x.get("subject") != null ) {
        Object[] prefix = getPrefix(x);
        if ( prefix != null ) {
          Object[] ret = new Object[1 + args.length];
          System.arraycopy(prefix, 0, ret, 0, prefix.length);
          System.arraycopy(args, 0, ret, prefix.length, args.length);
          return ret;
        }
      }
    } catch ( Throwable t ) {
      // NPE thrown when XLocator is not yet setup.
      // the XLocator exists, but x.gets will fail.
    }
    return super.prefix(args);
  }

  protected Object[] getPrefix(X x) {
    StringBuilder sb = null;
    String spid = (String) x.get("spid");
    if ( ! SafetyUtil.isEmpty(spid) ) {
      sb = new StringBuilder();
      sb.append("{spid:");
      sb.append(spid);
    }
    Subject subject = (Subject) x.get("subject");
    if ( subject != null &&
         subject.getRealUser() != null ) {
      User user = subject.getRealUser();
      if ( SafetyUtil.isEmpty(spid) ) {
        spid = user.getSpid();
        sb = new StringBuilder();
        sb.append("{spid:");
        sb.append(user);
      }
      sb.append(",user:");
      sb.append(user.getId());
      if ( subject.isAgent() ) {
        sb.append(",agent:");
        sb.append(subject.getUser().getId());
      }
    }
    if ( sb != null ) {
      sb.append("}");
      
      return new Object[] { sb.toString() };
    }

    return null;
  }
}
