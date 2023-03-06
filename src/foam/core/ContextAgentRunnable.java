/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;

public class ContextAgentRunnable
  implements Runnable
{
  final X            x_;
  final ContextAgent agent_;
  final String       description_;

  public ContextAgentRunnable(X x, ContextAgent agent, String description) {
    x_           = x;
    agent_       = agent;
    description_ = description;
  }

  public String toString() {
    return description_;
  }

  public void run() {
    X oldX = ((ProxyX) XLocator.get()).getX();
    XLocator.set(x_);
    String savedThreadName = Thread.currentThread().getName();
    try {
      if ( ! foam.util.SafetyUtil.isEmpty(description_) ) {
        Thread.currentThread().setName(description_);
      }
      agent_.execute(x_);
    } catch (RuntimeException e) {
      Logger logger = (Logger) x_.get("logger");
      logger.error(e);
      ((DAO) x_.get("alarmDAO")).put(new Alarm.Builder(x_)
        .setName("Uncaught exception in rule action: " + description_)
        .setReason(AlarmReason.UNDEFINED_BEHAVIOUR)
        .setNote(e.getMessage())
        .build());
    } finally {
      XLocator.set(oldX);
      Thread.currentThread().setName(savedThreadName);
    }
  }
}
