/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao',
  name: 'DAOInterceptor',

  methods: [
    {
      name: 'write',
      type: 'foam.core.FObject',
      async: true,
      args: [
        {
          name: 'context',
          type: 'Context'
        },
        {
          name: 'dao',
          type: 'foam.dao.DAO'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'existing',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'read',
      type: 'foam.core.FObject',
      async: true,
      args: [
        {
          name: 'context',
          type: 'Context'
        },
        {
          name: 'dao',
          type: 'foam.dao.DAO'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    },
    {
      name: 'remove',
      type: 'foam.core.FObject',
      async: true,
      args: [
        {
          name: 'context',
          type: 'Context'
        },
        {
          name: 'dao',
          type: 'foam.dao.DAO'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ]
    }
  ]
});
