/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'ExternalAPIException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  javaCode: `
    public ExternalAPIException(String message) {
      super(message);
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'status',
      value: '500'
    },
    {
      class: 'String',
      name: 'errorCode',
      value: '1010'
    }
  ]
});
