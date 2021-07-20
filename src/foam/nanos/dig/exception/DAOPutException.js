/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DAOPutException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public DAOPutException(String message) {
            super(message);
          }

          public DAOPutException(String message, Throwable cause) {
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
      name: 'status',
      value: '400'
    },
    {
      class: 'String',
      name: 'errorCode',
      value: '1001'
    }
  ]
});
