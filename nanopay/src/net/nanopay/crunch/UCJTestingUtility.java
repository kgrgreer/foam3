/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.crunch;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.crunch.AgentCapabilityJunction;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.UserCapabilityJunction;


public class UCJTestingUtility {
  public static UserCapabilityJunction fetchJunctionPeriodically(X x, CapabilityJunctionStatus status, Predicate predicate, int loops, int millisSleep, boolean isDebuggingOn, String debuggerName){
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    UserCapabilityJunction ucj = null;

    int i = 0;
    while(i < loops) {
      ucj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(predicate);

      if ( isDebuggingOn ){
        System.out.println(debuggerName + " loop " + i + ": " + ucj.getStatus());
      }

      if (ucj.getStatus() == status) {
        break;
      }
      try {
        Thread.sleep(millisSleep);
      } catch (InterruptedException e) {
        // nop
      }
      i++;
    }

    return ucj;
  }

  public static AgentCapabilityJunction fetchAgentJunctionPeriodically(X x, CapabilityJunctionStatus status, Predicate predicate, int loops, int millisSleep, boolean isDebuggingOn, String debuggerName){
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    AgentCapabilityJunction ucj = null;

    int i = 0;
    while(i < loops) {
      ucj = (AgentCapabilityJunction) userCapabilityJunctionDAO.find(predicate);

      if ( isDebuggingOn ){
        System.out.println(debuggerName + " loop " + i + ": " + ucj.getStatus());
      }

      if (ucj.getStatus() == status) {
        break;
      }
      try {
        Thread.sleep(millisSleep);
      } catch (InterruptedException e) {
        // nop
      }
      i++;
    }

    return ucj;
  }
}
