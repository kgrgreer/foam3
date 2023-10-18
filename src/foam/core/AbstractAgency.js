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
    'foam.core.ProxyX',
    'foam.core.X',
    'foam.core.XLocator',
    'foam.nanos.logger.Loggers',
    'java.util.Timer',
    'java.util.TimerTask',
    'java.util.concurrent.ConcurrentHashMap'
  ],

  javaCode: `
    protected static final Timer TIMER = new Timer("Agency Scheduler");
    protected static final ConcurrentHashMap<String, TimerTask> TASK_QUEUE = new ConcurrentHashMap<>();

    public void schedule(X x, ContextAgent agent, String key, long delay) {
      if ( delay <= 0 ) {
        submit(x, agent, key);
        return;
      }

      var logger = Loggers.logger(x, this, "schedule");

      // Do not re-schedule existing task with the same key. Subsequent attempts
      // to schedule the same task/key are ignored until the task is executed
      // and removed from the queue.
      if ( TASK_QUEUE.containsKey(key) ) {
        logger.info("ignored re-scheduling existing task", key);
        return;
      }

      // Schedule new task to execute the agent
      var task = new TimerTask() {
        public void run() {
          logger.debug("running", key, delay);
          submit(x,
            (x) -> {
              try {
                agent.execute(x);
              } catch ( Throwable t ) {
                logger.error("failed", key, t);
              } finally {
                TASK_QUEUE.remove(key);
              }
            }
            , key);
        }
      };
      TASK_QUEUE.put(key, task);
      TIMER.schedule(task, delay);
    }
  `
});
