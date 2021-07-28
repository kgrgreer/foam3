/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'AccountNotFoundException',
  package: 'foam.nanos.auth',
  extends: 'foam.nanos.auth.AuthenticationException',
  javaGenerateDefaultConstructor: false,
  javaGenerateConvenienceConstructor: false,

  properties: [
    {
      name: 'exceptionMessage',
      value: 'Unknown account'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        public AccountNotFoundException() {
          super();
        }
      
        public AccountNotFoundException(String message) {
          super(message);
        }
      
        public AccountNotFoundException(String message, Exception cause) {
          super(message, cause);
        }
      
        public AccountNotFoundException(Exception cause) {
          super(cause);
        }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'errorCode',
      value: '1013'
    }
  ]
});
