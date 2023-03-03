/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResetPasswordService',
  client: true,
  skeleton: true,

  methods: [
    {
      name: 'resetPasswordByCode',
      async: true,
      args: 'Context x, String identifier, String userName',
      type: 'Void'
    },
    {
      name: 'resetPassword',
      async: true,
      args: 'Context x, ResetPasswordByCode newPasswordObj',
      type: 'Void'
    }
  ]
});
