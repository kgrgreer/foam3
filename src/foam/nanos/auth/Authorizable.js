/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
    package: 'foam.nanos.auth',
    name: 'Authorizable',

    documentation: `
      A model should implement this interface if it is authorizable, meaning some
      users are allowed to operate on (create, read, update, or delete) that
      object but others are not.
    `,

    methods: [
      {
        name: 'authorizeOnCreate',
        args: 'Context x',
        javaThrows: ['foam.nanos.auth.AuthorizationException']
      },
      {
        name: 'authorizeOnRead',
        args: 'Context x',
        javaThrows: ['foam.nanos.auth.AuthorizationException']
      },
      {
        name: 'authorizeOnUpdate',
        args: 'Context x, foam.core.FObject oldObj',
        javaThrows: ['foam.nanos.auth.AuthorizationException']
      },
      {
        name: 'authorizeOnDelete',
        args: 'Context x',
        javaThrows: ['foam.nanos.auth.AuthorizationException']
      }
    ]
  });
