/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.Loggers;

import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AsyncAgency is passed to async rule.action
 * for immediate execution of agent.
 */
public class DirectAgency implements Agency {
  protected static final Timer TIMER = new Timer();
  protected static final ConcurrentHashMap<String, TimerTask> TASK_QUEUE = new ConcurrentHashMap<>();

  public void submit(X x, ContextAgent agent, String description) {
    agent.execute(x);
  }

  public void schedule(X x, ContextAgent agent, String key, int delay) {
    var task = TASK_QUEUE.get(key);

    // Cancel the task if it's not yet executed and being re-scheduled
    if ( task != null
      && task.scheduledExecutionTime() - System.currentTimeMillis() > 0
    ) {
      task.cancel();
      Loggers.logger(x, this).debug("Merge scheduled task", key);
    }

    // Schedule executing the agent
    task = new TimerTask() {
      @Override
      public void run() {
        agent.execute(x);
        TASK_QUEUE.remove(key);
      }
    };
    TASK_QUEUE.put(key, task);
    TIMER.schedule(task, delay);
  }
}
