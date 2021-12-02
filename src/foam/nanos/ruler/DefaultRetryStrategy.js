/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'DefaultRetryStrategy',

  implements: [ 'foam.nanos.ruler.RetryStrategy' ],

  properties: [
    {
      class: 'Int',
      name: 'maxRetry'
    },
    {
      class: 'Int',
      name: 'retryDelay'
    }
  ],

  methods: [
    {
      name: 'getRetryDelay',
      args: [ 'Long t' ],
      javaCode: 'return getRetryDelay();'
    }
  ]
});
