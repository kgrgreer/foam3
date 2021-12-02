/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'ExponentialBackoffRetryStrategy',
  extends: 'foam.nanos.ruler.DefaultRetryStrategy',

  properties: [
    {
      class: 'Int',
      name: 'exponentialBase',
      value: 2
    }
  ],

  methods: [
    {
      name: 'getRetryDelay',
      args: [ 'Long t' ],
      javaCode: `
        return (long) (getRetryDelay() * Math.pow(getExponentialBase(), t));
      `
    }
  ]
});
