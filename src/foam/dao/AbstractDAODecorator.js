/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'AbstractDAODecorator',
  implements: ['foam.dao.DAOInterceptor'],

  flags: [],

  methods: [
    function write(X, dao, obj, existing) {
      return Promise.resolve(obj);
    },
    function read(X, dao, obj) {
      return Promise.resolve(obj);
    },
    function remove(X, dao, obj) {
      return Promise.resolve(obj);
    }
  ]
});
