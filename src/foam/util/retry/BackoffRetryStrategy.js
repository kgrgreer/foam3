/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.retry',
  name: 'BackoffRetryStrategy',
  extends: 'foam.util.retry.SimpleRetryStrategy',

  properties: [
    {
      class: 'Int',
      name: 'factorBase',
      value: 2
    }
  ],

  methods: [
    {
      name: 'getRetryDelay',
      javaCode: `
        if ( canRetry(x) ) {
          var factor = Math.pow(getFactorBase(), retryCount.getAndIncrement());
          return (long) (getRetryDelay() * factor);
        }
        throw new RetryLimitReachedException();
      `
    }
  ]
});
