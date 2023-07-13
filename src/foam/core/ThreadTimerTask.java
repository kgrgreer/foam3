/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.ContextAgent;
import foam.core.ProxyX;
import foam.core.X;
import foam.core.XLocator;
import java.util.TimerTask;

/**
  TimerTask which executes ContextAgent in its own thread.
*/
public class ThreadTimerTask
  extends TimerTask {

  protected X x_;
  protected ContextAgent agent_;
  protected String name_;
  public int priority_ = Thread.NORM_PRIORITY;

  public ThreadTimerTask(X x, ContextAgent agent) {
    this(x, agent, agent.getClass().getSimpleName());
  }

  public ThreadTimerTask(X x, ContextAgent agent, String name) {
    super();
    this.x_ = x;
    this.agent_ = agent;
    this.name_ = name;
  }

  public ThreadTimerTask(X x, ContextAgent agent, String name, int priority) {
    super();
    this.x_ = x;
    this.agent_ = agent;
    this.name_ = name;
    this.priority_ = priority;
  }

  public void run() {
    final X oldX = ((ProxyX) XLocator.get()).getX();
    Thread thread = new Thread(() -> {
        try {
          XLocator.set(x_);
          agent_.execute(x_);
        } catch (Throwable t) {
          foam.nanos.logger.StdoutLogger.instance().error("ThreadTimerTask", agent_.getClass().getSimpleName(), name_, t.getMessage(), t);
        } finally {
          XLocator.set(oldX);
        }
    }, name_);
    thread.setDaemon(true);
    thread.setPriority(priority_);
    thread.start();
  }
}
