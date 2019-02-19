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
      type: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'bankAccountId',
          type: 'Long',
        },
        {
          name: 'randomDepositAmount',
          type: 'Long',
        }
      ]
    }
  ]
});
