package net.nanopay.crunch;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.crunch.AgentCapabilityJunction;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.UserCapabilityJunction;


public class UCJTestingUtility {
  public static UserCapabilityJunction fetchJunctionPeriodically(X x, Predicate predicate, int loops, int millisSleep, boolean isDebuggingOn, String debuggerName){
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    UserCapabilityJunction ucj = null;

    int i = 0;
    while(i < loops) {
      ucj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(predicate);

      if ( isDebuggingOn ){
        System.out.println(debuggerName + " loop " + i + ": " + ucj.getStatus());
      }

      if (ucj.getStatus() == CapabilityJunctionStatus.GRANTED) {
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

  public static AgentCapabilityJunction fetchAgentJunctionPeriodically(X x, Predicate predicate, int loops, int millisSleep, boolean isDebuggingOn, String debuggerName){
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    AgentCapabilityJunction ucj = null;

    int i = 0;
    while(i < loops) {
      ucj = (AgentCapabilityJunction) userCapabilityJunctionDAO.find(predicate);

      if ( isDebuggingOn ){
        System.out.println(debuggerName + " loop " + i + ": " + ucj.getStatus());
      }

      if (ucj.getStatus() == CapabilityJunctionStatus.GRANTED) {
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
