/**ß
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'UnsupportException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  javaCode: `
    public UnsupportException(String message) {
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
      class: 'String',
      name: 'errorCode',
      value: '1004'
    }
  ]
});
