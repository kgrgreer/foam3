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
          protected DAONotFoundException() { }

          public DAONotFoundException(String daoName) {
            setDaoName(daoName);
            setMessage(getTranslation());
          }
        `
        );
      }
    }
  ],

  properties: [
    {
      name: 'exceptionMessage',
      value: 'DAO not found: {{daoName}}'
    },
    {
      class: 'String',
      name: 'daoName'
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
