/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DAORequiredException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',
  javaGenerateDefaultConstructor: false,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public DAORequiredException() {
            super();
          }

          public DAORequiredException(Throwable cause) {
            super(cause);
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
      value: 'DAO name required'
    },
    {
      class: 'String',
      name: 'status',
      value: '404'
    },
    {
      class: 'String',
      name: 'errorCode',
      value: '1008'
    }
  ]
});
