/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'CompoundDAODecorator',

  flags: [],

  implements: ['foam.dao.DAOInterceptor'],

  properties: [
    {
      class: 'Array',
      name: 'decorators'
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].write(X, dao, obj, existing).then(a) : obj;
      });
    },

    function read(X, dao, obj) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].read(X, dao, obj).then(a) : obj;
      });
    },

    function remove(X, dao, obj) {
      var i = 0;
      var d = this.decorators;

      return Promise.resolve(obj).then(function a(obj) {
        return d[i] ? d[i++].remove(X, dao, obj).then(a) : obj;
      });
    }
  ]
});
