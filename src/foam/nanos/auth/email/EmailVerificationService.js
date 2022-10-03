/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationService',
  skeleton: true,

  documentation: `
    Email verification service to verify user email by code.
  `,

  requires: [
    'foam.core.X'
  ],

  methods: [
    {
      name: 'verifyByCode',
      type: 'Void',
      async: true,
      args: 'X x, String email'
    },
    {
      name: 'verifyCode',
      type: 'Boolean',
      async: true,
      args: 'X x, String email, String verificationCode'
    }
  ]
});
