/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DAONotFoundException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',
  javaGenerateDefaultConstructor: false,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public DAONotFoundException() { }

          public DAONotFoundException(String daoName) {
            super(daoName);
          }

          public DAONotFoundException(String daoName, Throwable cause) {
            super(daoName, cause);
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
      value: 'DAO not found {{message}}',
    },
    {
      class: 'String',
      name: 'status',
      value: '404'
    },
    {
      class: 'String',
      name: 'errorCode',
      value: '1000'
    }
  ]
});
