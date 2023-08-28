/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.ContextAgent;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.logger.Logger;
import foam.nanos.logger.Loggers;
import java.util.List;
import java.util.Date;

import static foam.mlang.MLang.*;

/**
   Find all GRANTED junctions that are past the expiration date,
   and if not in Grace period, expire them.
 */
public class ExpireUserCapabilityJunctionsCron implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO bareUserCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

    List<UserCapabilityJunction> activeJunctions = ((ArraySink) userCapabilityJunctionDAO
      .where(
        AND(
          EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED),
          NEQ(UserCapabilityJunction.EXPIRY, null),
          LTE(UserCapabilityJunction.EXPIRY, new Date())
        )
      )
      .select(new ArraySink()))
      .getArray();

    for ( UserCapabilityJunction activeJunction : activeJunctions ) {
      if ( ! activeJunction.isInGracePeriod(x) ) {
        activeJunction = (UserCapabilityJunction) activeJunction.fclone();
        activeJunction.setStatus(CapabilityJunctionStatus.EXPIRED);
        userCapabilityJunctionDAO.put(activeJunction);
        Loggers.logger(x, this).debug("UserCapabilityJunction Expired",activeJunction.getId());
      }
    }
  }
}
