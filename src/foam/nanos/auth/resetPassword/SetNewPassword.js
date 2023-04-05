/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'SetNewPassword',
  extends: 'foam.nanos.auth.resetPassword.ResetPasswordByToken',
  documentation: `Model to allow users to set a new password.
   Helpful for users that are created on the platform but havent logged in yet`,

  messages: [
    { name: 'TITLE', message: 'Set your password' },
    { name: 'INSTRUCTION', message: 'Create a password in order to log into your account.' }
  ],
});
