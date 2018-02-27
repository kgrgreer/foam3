/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.cico.service',
  name: 'BankAccountVerifier',

  methods: [
    {
      name: 'verify',
      returns: 'Promise',
      javaReturns: 'boolean',
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
    }
  ]
});
