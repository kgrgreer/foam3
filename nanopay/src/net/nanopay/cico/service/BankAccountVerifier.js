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
      async: true,
      returns: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'bankAccountId',
          javaType: 'long',
          swiftType: 'Int'
        },
        {
          name: 'randomDepositAmount',
          javaType: 'long',
          swiftType: 'Int'
        }
      ]
    }
  ]
});
