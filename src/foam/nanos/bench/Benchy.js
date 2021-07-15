/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'Benchy',

  implements: [
    'foam.nanos.bench.Benchmark'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    }
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
    },
    {
      name: 'execute',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      `
    }
  ]

});
