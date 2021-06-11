/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'AuthorizationException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  documentation: `
    Thrown when a user tries to access a resource that they don't have
    permission to access.
  `,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AuthorizationException(String message) {
            super(message);
          } 
        `
        );
      }
    }
  ],

  properties: [
    {
      name: 'exceptionMessage',
      class: 'String',
      value: 'You do not have permission to access the service named {{message}}'
    },
    {
      class: 'String',
      name: 'status',
      value: '403'
    },
    {
      class: 'String',
      name: 'errorCode',
      value: '1009'
    }
  ]
});
