/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'CachedUCJQueryService',
  documentation: 'A cached implementation of the UCJQueryService interface.',

  javaImports: [
    'java.util.ArrayList',
    'java.util.List',
    'foam.core.FObject'
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache'
    },
    {
      class: 'Int',
      name: 'TTL',
      value: 5000
    }
  ],

  methods: [
    {
      name: 'getRoles',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        }
      ],
      javaCode: `
        return new ArrayList<>();
      `
    },
    {
      name: 'getUsers',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        }
      ],
      javaCode: `
        return new ArrayList<>();
      `
    },
    {
      name: 'getApproversByLevel',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'level',
          type: 'Integer'
        }
      ],
      javaCode: `
        return new ArrayList<>();
      `
    }
  ],

  listeners: [
    {
      name: 'purge',
      code: function() {
        for (let [key, value] of Object.entries(this.cache)) {
          if ( value.date.getTime() >= Date.now() - this.ttl ) continue;
          delete this.cache[key];
        }
      }
    }
  ]
});
