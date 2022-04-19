/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.retry',
  name: 'NoRetryStrategy',
  implements: [ 'foam.util.retry.RetryStrategy' ],

  methods: [
    {
      name: 'getMaxRetry',
      javaCode: 'return 0;'
    },
    {
      name: 'getRetryDelay',
      javaCode: 'throw new UnsupportedOperationException("No retry");'
    },
    {
      name: 'canRetry',
      javaCode: 'return false;'
    }
  ]
});
