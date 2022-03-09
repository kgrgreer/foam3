/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.retry',
  name: 'RetryStrategyFactory',

  documentation: 'Factory for generating new RetryStrategy.',

  javaImplements: [
    'foam.core.XFactory'
  ],

  javaCode: `
    public final static RetryStrategy NO_RETRY_STRATEGY = new NoRetryStrategy();
  `,

  properties: [
    {
      class: 'FObjectProperty',
      name: 'prototype'
    }
  ],

  methods: [
    {
      name: 'create',
      args: [ 'Context x' ],
      type: 'Object',
      javaCode: `
        if ( getPrototype() != null ) {
          return getPrototype().fclone();
        }
        return NO_RETRY_STRATEGY;
      `
    }
  ]
});
