/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.retry',
  name: 'RetryForeverStrategy',
  extends: 'foam.util.retry.SimpleRetryStrategy',

  properties: [
    {
      name: 'maxRetry',
      javaGetter: 'return Integer.MAX_VALUE;'
    }
  ],

  methods: [
    {
      name: 'canRetry',
      javaCode: 'return true;'
    }
  ]
});
