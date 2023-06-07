/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pool',
  name: 'AbstractFixedThreadPool',
  abstract: true,
  extends: 'foam.core.AbstractAgency',

  properties: [
    {
      class: 'String',
      name: 'prefix',
      value: 'nanos'
    },
    {
      name: 'threadsPerCore',
      class: 'Int',
      value: 8
    },
    {
      description: `Calculate total threads based on available cores.  Set minimum threads to avoid resource exhaustion in small VMs and small development hardware.`,
      class: 'Int',
      name: 'numberOfThreads',
      javaFactory: `
      return Math.max(64, getThreadsPerCore() * Runtime.getRuntime().availableProcessors());
      `
    },
    {
      class: 'Long',
      name: 'queued'
    },
    {
      class: 'Long',
      name: 'executed'
    },
    {
      class: 'Long',
      name: 'executing'
    }
  ]
});
