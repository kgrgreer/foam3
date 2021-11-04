/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'ParsingErrorException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  javaCode: `
    public ParsingErrorException(String message) {
      super(message);
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'status',
      value: '400'
    },
    {
      class: 'Int',
      name: 'code',
      value: 1003
    }
  ]
});
