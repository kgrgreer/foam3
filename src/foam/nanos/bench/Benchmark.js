/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'Benchmark',
  abstract: true,

  properties: [
    {
      class: 'String',
      name: 'id'
    }
  ],

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    {
      name: 'setup',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      `
    },
    {
      name: 'teardown',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'stats',
          type: 'java.util.Map'
        }
      ],
      javaCode: `
      `
    }
  ]
});
