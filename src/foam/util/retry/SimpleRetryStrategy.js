/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.retry',
  name: 'SimpleRetryStrategy',
  implements: [ 'foam.util.retry.RetryStrategy' ],

  javaImports: [
    'java.util.concurrent.atomic.AtomicInteger'
  ],

  javaCode: `
    protected final AtomicInteger retryCount = new AtomicInteger();
  `,

  properties: [
    {
      class: 'Int',
      name: 'maxRetry'
    },
    {
      class: 'Long',
      name: 'retryDelay'
    }
  ],

  methods: [
    {
      name: 'getRetryDelay',
      args: [ 'Context x' ],
      javaCode: `
        if ( canRetry(x) ) {
          retryCount.getAndIncrement();
          return getRetryDelay();
        }
        throw new RetryLimitReachedException();
      `
    },
    {
      name: 'canRetry',
      javaCode: 'return retryCount.get() < getMaxRetry();'
    }
  ]
});
