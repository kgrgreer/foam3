/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.logger.Logger;
import java.util.List;
import java.util.Date;

import static foam.mlang.MLang.*;

public class ExpireUserCapabilityJunctionsCron implements ContextAgent {

  private Logger logger;
  private DAO userCapabilityJunctionDAO;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    Date today = new Date();

    // Find all junctions that are past the expiration date and filter by the following
    //    - If ucj is still GRANTED and not in grace period, it needs to be returned 
    //      and reput such that it is either in graceperiod (if applicable) or expired
    //    - if ucj is in grace period, and the graceperiod is less than or equals to 0 days left
    //    - return the ucj and reput it in EXPIRED status
    List<UserCapabilityJunction> activeJunctions = ((ArraySink) userCapabilityJunctionDAO
      .where(
        AND(
          NEQ(UserCapabilityJunction.EXPIRY, null),
          LT(UserCapabilityJunction.EXPIRY, today),
          OR(
            AND(
              EQ(UserCapabilityJunction.IS_IN_GRACE_PERIOD, true),
              LTE(UserCapabilityJunction.GRACE_PERIOD, 0)),
            AND(
              EQ(UserCapabilityJunction.IS_IN_GRACE_PERIOD, false),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED))
          )
      ))
      .select(new ArraySink()))
      .getArray();

    for ( UserCapabilityJunction activeJunction : activeJunctions ) {
      activeJunction = (UserCapabilityJunction) activeJunction.fclone();
      if ( activeJunction.getIsInGracePeriod() || activeJunction.getGracePeriod() <= 0 ) {
        activeJunction.setStatus(CapabilityJunctionStatus.EXPIRED);
        activeJunction.setIsExpired(true);
      } else {
        activeJunction.setIsInGracePeriod(true);
      }
      if ( activeJunction.getStatus() == CapabilityJunctionStatus.EXPIRED ) {
        activeJunction.getPayload().clearData();
      }
      
      logger.debug("Moved UserCapabilityJunction : " + activeJunction.getId() + " into status :" + activeJunction.getStatus());
      userCapabilityJunctionDAO.put(activeJunction);
    }
  }
}
