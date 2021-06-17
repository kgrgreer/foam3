/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AuthorizationException',
  extends: 'foam.core.FOAMException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  documentation: `
    Thrown when a user tries to access a resource that they don't have
    permission to access.
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthorizationException() {
            super("Permission denied.");
          }

          public AuthorizationException(String message) {
            super(message);
          }

          public AuthorizationException(String message, Throwable cause) {
            super(message, cause);
          } 
        `
        );
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'errorCode',
      value: '1009'
    }
  ]
});
