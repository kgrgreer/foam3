/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.retry',
  name: 'RetryUntilStrategy',
  extends: 'foam.util.retry.RetryForeverStrategy',

  properties: [
    {
      class: 'DateTime',
      name: 'until'
    }
  ],

  methods: [
    {
      name: 'canRetry',
      javaCode: `
        if ( getUntil() != null ) {
          return System.currentTimeMillis() <= getUntil().getTime();
        }
        return false;
      `
    }
  ]
});
