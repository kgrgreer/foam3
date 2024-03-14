/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pool',
  name: 'Throttle',

  documentation: 'A throttled counting semaphore.',

  implements: [ 'foam.nanos.boot.NSpecAware' ],

  javaImports: [
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      javaFactory: `
        foam.nanos.boot.NSpec nspec = getNSpec();
        if ( nspec != null ) {
          return nspec.getName();
        }
        return "Throttle";
      `
    },
    {
      class: 'Float',
      name: 'rate',
      value: 1,
      units: 'tps'
    },
    {
      class: 'Long',
      name: 'queued',
      documentation: 'Current number of throttled threads.'
    },
    {
      class: 'Long',
      name: 'executed',
      documentation: 'Total number of throttled threads.'
    },
    {
      class: 'Long',
      name: 'nextActivity',
      documentation: 'Time of next allowed execution.'
    }
  ],

  methods: [
    {
      name: 'throttle',
      javaCode: `
        long now, thn;
        synchronized ( this ) {
          setQueued(getQueued() + 1);
          now = System.currentTimeMillis();
          thn = getNextActivity();
          setNextActivity(Math.max(now, thn) + (long) Math.ceil(1000.0 / getRate()));
        }

        try {
          PM pm = PM.create(getX(), getName(), "throttle");
          long delay = thn - now;
          if ( delay > 0 )
            Thread.sleep(delay);
          pm.log(getX());
        } catch (InterruptedException e) {
        }

        synchronized ( this ) {
          setQueued(getQueued() - 1);
          setExecuted(getExecuted() + 1);
        }
      `
    },
    {
      name: 'currentDelay',
      type: 'long',
      documentation: 'Estimated delay in ms if throttle() were called now.',
      javaCode: `
        long now = System.currentTimeMillis();
        long thn = getNextActivity();
        return Math.max(thn-now, 0);
      `,
      synchronized: true
    }
  ]
});
