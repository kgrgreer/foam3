/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
  name: 'CMResult',

  properties: [
    {
      class: 'String',
      name: 'key'
    },
    {
      class: 'Float',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String'
    }
  ]
})