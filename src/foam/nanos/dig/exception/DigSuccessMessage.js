/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DigSuccessMessage',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',
  javaGenerateDefaultConstructor: false,

  javaCode: `
    public DigSuccessMessage() {
      super();
    }

    public DigSuccessMessage(String message) {
      super(message);
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'status',
      value: '200'
    },
    {
      class: 'String',
      name: 'errorCode',
      value: '1006'
    }
  ]
});
