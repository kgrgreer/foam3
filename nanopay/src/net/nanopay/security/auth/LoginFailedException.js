/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'LoginFailedException',
  package: 'net.nanopay.security.auth',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      name: 'exceptionMessage',
      value: '{{message}} attempts remaining'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  protected LoginFailedException() {
  }

  public LoginFailedException(String message) {
    super(message);
  }

  public LoginFailedException(String message, Exception cause) {
    super(message, cause);
  }
        `);
      }
    }
  ]
});
