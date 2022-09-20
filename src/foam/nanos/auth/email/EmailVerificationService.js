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
    Email verification service to verify user email by code or by token
  `,
  methods: [
    {
      name: 'verifyByCode',
      type: 'Void',
      async: true,
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'foam.nanos.auth.User' }
      ]
    },
    {
      name: 'verifyCode',
      type: 'Boolean',
      async: true,
      args: [
        { name: 'x', type: 'Context' },
        { name: 'email', type: 'String' },
        { name: 'verificationCode', type: 'String' }
      ]
    }
  ]
});
