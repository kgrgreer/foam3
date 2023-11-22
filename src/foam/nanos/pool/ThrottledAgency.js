/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pool',
  name: 'ThrottledAgency',
  implements: [ 'foam.core.Agency', 'foam.nanos.NanoService' ],
  javaImplements: [ 'Runnable' ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.ContextAgentTimerTask',
    'foam.core.X',
    'foam.core.XLocator',
    'foam.core.ProxyX',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.concurrent.BlockingQueue',
    'java.util.concurrent.LinkedBlockingQueue'
  ],

  documentation: 'A single-threaded throttled Agency which runs queued Agents at a specified rate.',

  properties: [
    {
      class: 'String',
      name: 'name',
      value: 'ThrottledAgency'
    },
    {
      class: 'Float',
      name: 'rate',
      value: 1,
      units: 'tps'
    },
    {
      class: 'Object',
      name: 'queue',
      javaType: 'BlockingQueue',
      javaFactory: 'return new LinkedBlockingQueue();'
    },
    {
      class: 'Long',
      name: 'queued'
    },
    {
      class: 'Long',
      name: 'executed'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      Thread t = new Thread(this);
      t.setName(getName());
      t.setDaemon(true);
      t.start();
      `
    },
    {
      name: 'submit',
      javaCode: `
      setQueued(getQueued() + 1);
      try {
        getQueue().put(new Runnable() { public void run() {
          X oldX = ((ProxyX) XLocator.get()).getX();
          XLocator.set(x);
          try {
            agent.execute(x);
          } catch (Throwable t) {
            // Loggers.logger(x, this).error("schedule", "failed", key, t);
          } finally {
            XLocator.set(oldX);
          }
        }});
      } catch (InterruptedException e) {
      }`
    },
    {
      name: 'schedule',
      javaCode: 'throw new UnsupportedOperationException();'
    },
    {
      name: 'run',
      type: 'void',
      javaCode: `
        while ( true ) {
          try {
            Runnable agent = (Runnable) getQueue().take();

            setExecuted(getExecuted() + 1);

            long start = System.currentTimeMillis();

            agent.run();

            long end   = System.currentTimeMillis();
            long dur   = end-start;
            long delay = ((long) Math.floor(1000.0 / getRate())) - dur;

            if ( dur > 0 ) {
              try { Thread.sleep(delay); } catch (InterruptedException e) { }
            }
          } catch (InterruptedException e) {  }
        }
      `
    }
  ]
});
