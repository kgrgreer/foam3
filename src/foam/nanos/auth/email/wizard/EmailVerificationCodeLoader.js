/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email.wizard',
  name: 'EmailVerificationCodeLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  documentation: 'Send email verification code when loaded',

  imports: [ 'emailVerificationService' ],

  requires: [
    'foam.nanos.auth.email.EmailVerificationCode'
  ],

  methods: [
    async function load({ old }) {
      const data = this.delegate ? await this.delegate.load({ old }) : old;
      if ( this.EmailVerificationCode.isInstance(data) && data.email ) {
        await this.emailVerificationService.verifyByCode(null, data.email, data.userName, '');
      }
      return data;
    }
  ]
});
