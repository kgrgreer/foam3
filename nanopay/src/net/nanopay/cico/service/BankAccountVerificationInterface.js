/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.cico.service',
  name: 'BankAccountVerificationInterface',
  extends: 'foam.nanos.NanoService',

  methods: [
    {
      name: 'verify',
      javaReturns: 'boolean',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'bankAccountId',
          javaType: 'long'
        },
        {
          name: 'randomDepositAmount',
          javaType: 'long'
        }
      ]
    },
    {
      name: 'addCashout',
      javaReturns: 'boolean',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'obj',
          javaType: 'foam.core.FObject'
        }
      ]
    }
  ]
});
