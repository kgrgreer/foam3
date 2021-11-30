/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'AbstractAgency',
  abstract: true,
  implements: [ 'foam.core.Agency' ],

  javaImports: [
    'foam.nanos.logger.Loggers',
    'java.util.Timer',
    'java.util.TimerTask',
    'java.util.concurrent.ConcurrentHashMap'
  ],

  javaCode: `
    protected static final Timer TIMER = new Timer();
    protected static final ConcurrentHashMap<String, TimerTask> TASK_QUEUE = new ConcurrentHashMap<>();

    public void schedule(X x, ContextAgent agent, String key, long delay) {
      if ( delay <= 0 ) {
        submit(x, agent, key);
        return;
      }

      var task = TASK_QUEUE.get(key);

      // Cancel the task if it's not yet executed and being re-scheduled
      if ( task != null
        && task.scheduledExecutionTime() - System.currentTimeMillis() > 0
      ) {
        task.cancel();
        Loggers.logger(x, this).debug("schedule", "cancel", key);
      }

      // Schedule executing the agent
      task = new TimerTask() {
        @Override
        public void run() {
          try { agent.execute(x); }
          catch ( Exception e ) {
            Loggers.logger(x, this).error("schedule", "failed", key);
          }
          TASK_QUEUE.remove(key);
        }
      };
      TASK_QUEUE.put(key, task);
      TIMER.schedule(task, delay);
    }
  `
});
