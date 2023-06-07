/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'PingCmd',

  ids: ['source', 'destination'],

  properties: [
    {
      name: 'source',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      name: 'destination',
      class: 'String'
    },
    {
      name: 'start',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'echo',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'end',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'total',
      class: 'Duration',
      getter: function() { return this.end - this.start; },
      javaGetter: `return getEnd() - getStart();`,
      storageTransient: true,
      networkTransient: true
    }
  ],
  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.source+" -> "+this.destination+": "+this.total;
      },
      javaCode: `
        return getSource()+" -> "+getDestination()+": "+String.valueOf(getTotal());
      `
    }
  ]
});
