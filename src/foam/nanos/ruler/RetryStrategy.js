/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.ruler',
  name: 'RetryStrategy',

  methods: [
    {
      name: 'getMaxRetry',
      type: 'Integer'
    },
    {
      name: 'getRetryDelay',
      type: 'Long',
      args: [ 'Long t' ]
    }
  ]
});
