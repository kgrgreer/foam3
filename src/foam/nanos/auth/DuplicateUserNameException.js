/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'DuplicateUserNameException',
  package: 'foam.nanos.auth',
  extends: 'foam.core.ValidationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      name: 'exceptionMessage',
      value: 'Username already in use'
    }
  ],

  javaCode: `
    public DuplicateUserNameException() {
      super();
    }

    public DuplicateUserNameException(String message) {
      super(message);
    }

    public DuplicateUserNameException(Throwable cause) {
      super(cause);
    }

    public DuplicateUserNameException(String message, Throwable cause) {
      super(message, cause);
    }
  `
});
