/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.Agency;
import foam.core.ContextAgent;
import foam.core.X;
import java.util.TimerTask;

/**
  TimerTask which executes a ContextAgent
*/
public class ContextAgentTimerTask
  extends TimerTask {

  X x_;
  ContextAgent agent_;

  public ContextAgentTimerTask(X x, ContextAgent agent) {
    super();
    this.x_ = x;
    this.agent_ = agent;
  }

  public void run() {
    agent_.execute(x_);
  }
}
