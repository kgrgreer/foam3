/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.exchangerate',
  name: 'ExchangeRate',
  extends: 'foam.nanos.NanoService',
  methods: [
    {
      name: 'getRate',
      javaReturns: 'foam.core.FObject',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'from',
          javaType: 'String'
        },
        {
          name: 'to',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Long'
        }
      ]
    }
  ]
});
