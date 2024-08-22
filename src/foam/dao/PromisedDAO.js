/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PromisedDAO',
  extends: 'foam.dao.AbstractDAO',

  properties: [
    {
      class: 'Promised',
      of: 'foam.dao.DAO',
      methods: [ 'put_', 'remove_', 'find_', 'select_', 'removeAll_', 'listen_', 'cmd_' ],
      name: 'promise',
      factory: function() { return foam.core.Latch.create(); }
    }
  ],

  methods: [
    {
      name: 'listen_',
      flags: ['js'],
      code: function(x, sink, predicate) {
        return foam.dao.PromisedDetachable.create({promise: this.promise.then(dao => {
          return dao.listen_(x, sink, predicate);
        })});
      }
    }
  ]
});
