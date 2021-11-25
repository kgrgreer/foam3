/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AuthenticationException',
  package: 'foam.nanos.auth',
  extends: 'foam.core.ClientRuntimeException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  javaCode: `
    public AuthenticationException() {
      super();
    }

    public AuthenticationException(String message) {
      super(message);
    }

    public AuthenticationException(Throwable cause) {
      super(cause);
    }

    public AuthenticationException(String message, Throwable cause) {
      super(message, cause);
    }
  `
});
