/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.util.retry',
  name: 'RetryStrategy',

  methods: [
    {
      name: 'getMaxRetry',
      type: 'Integer'
    },
    {
      name: 'getRetryDelay',
      type: 'Long',
      args: [ 'Context x' ]
    },
    {
      name: 'canRetry',
      type: 'Boolean',
      args: [ 'Context x' ]
    }
  ]
});
