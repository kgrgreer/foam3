/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'VerificationCodeException',
  extends: 'foam.core.ClientRuntimeException',
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      class: 'Int',
      name: 'remainingAttempts'
    }
  ],

  javaCode: `
    public VerificationCodeException(String message) {
      super(message);
    }

    public VerificationCodeException(String message, Throwable cause) {
      super(message, cause);
    }

    public VerificationCodeException(Throwable cause) {
      super(cause);
    }
  `
});
