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
      type: 'FObject[]',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        }
      ],
      javaCode: `
        return new FObject[1];
      `
    },
    {
      name: 'getUsers',
      type: 'FObject[]',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        }
      ],
      javaCode: `
        return new FObject[1];
      `
    },
    {
      name: 'getApproversByLevel',
      type: 'FObject[]',
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
        return new FObject[1];
      `
    }
  ]
});
