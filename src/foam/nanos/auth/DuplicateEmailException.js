/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'DuplicateEmailException',
  package: 'foam.nanos.auth',
  extends: 'foam.core.ValidationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      name: 'exceptionMessage',
      value: 'Email already in use'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public DuplicateEmailException() {
    super();
  }

  public DuplicateEmailException(String message) {
    super(message);
  }

  public DuplicateEmailException(Throwable cause) {
    super(cause);
  }

  public DuplicateEmailException(String message, Throwable cause) {
    super(message, cause);
  }
        `);
      }
    }
  ]
});
