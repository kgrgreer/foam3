/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'TokenExpiredException',
  package: 'foam.nanos.auth.token',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  javaCode: `
    public TokenExpiredException() {
      super();
    }

    public TokenExpiredException(String msg) {
      super(msg);
    }

    public TokenExpiredException(Exception cause) {
      super(cause);
    }
  `
});
