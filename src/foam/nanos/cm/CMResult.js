/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
  name: 'CMResult',

  documentation: `
    Model the result of CM, so the result can render into plot easiler.
  `,

  properties: [
    {
      class: 'String',
      name: 'key'
    },
    {
      class: 'Double',
      name: 'value'
    },

  ]
})