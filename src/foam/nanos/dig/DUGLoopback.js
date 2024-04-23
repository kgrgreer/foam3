/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGLoopback',

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      documentation: 'Last received HTTP post data',
      name: 'data',
      class: 'String'
    },
    {
      name: 'timestamp',
      class: 'DateTime',
    }
  ]
})
