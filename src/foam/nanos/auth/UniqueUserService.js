/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'UniqueUserService',

  proxy: true,

  methods: [
    {
      name: 'getUser',
      type: 'foam.nanos.auth.User',
      documentation: 'Helper logic function to reduce code duplication',
      args: [ 'Context x', 'String identifier' ]
    }
  ]
});
