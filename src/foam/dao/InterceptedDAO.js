/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'InterceptedDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.mlang.sink.Count',
    'foam.mlang.sink.GroupBy'
  ],

  properties: [
    {
//      class: 'FObjectProperty',
//      of: 'foam.dao.DAOInterceptor',
      name: 'decorator'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() { return this.delegate; }
    }
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        // TODO: obj.id can generate garbage, would be
        // slightly faster if DAO.find() could take an object
        // as well.
        var self = this;
        return ( ( ! obj?.id ) ? Promise.resolve(null) : this.dao.find_(x, obj.id) ).then(function(existing) {
          return self.decorator.write(x, self.dao, obj, existing);
        }).then(function(obj) {
          return self.delegate.put_(x, obj);
        });
      }
    },

    {
      name: 'remove_',
      code: function(x, obj) {
        var self = this;
        return this.decorator.remove(x, self.dao, obj).then(function(obj) {
          if ( obj ) return self.delegate.remove_(x, obj);
          return Promise.resolve();
        });
      }
    },

    {
      name: 'find_',
      code: function(x, id) {
        var self = this;
        return this.delegate.find_(x, id).then(function(obj) {
          return self.decorator.read(x, self.dao, obj);
        });
      }
    },

    /*
    TODO: works, but is expensive, so shouldn't be used if decorator.read isn't set
    function select_(x, sink, skip, limit, order, predicate) {
      if ( ! sink ) sink = foam.dao.ArraySink.create();
      // No need to decorate if we're just counting.
      if ( this.Count.isInstance(sink) ) {
        return this.delegate.select_(x, sink, skip, limit, order, predicate);
      }

      // TODO: This is too simplistic, fix
      if ( this.GroupBy.isInstance(sink) ) {
        return this.delegate.select_(x, sink, skip, limit, order, predicate);
      }

      var self = this;

      return new Promise(function(resolve, reject) {
        var ps = [];

        self.delegate.select({
          put: function(o) {
            var p = self.decorator.read(x, self.dao, o);
            p.then(function(o) { sink.put(o); })
            ps.push(p);
          },
          eof: function() {
          }
        }, skip, limit, order, predicate).then(function() {
          Promise.all(ps).then(function() {
            resolve(sink);
          });
        })
      });
    }
    */

    // TODO: Select/removeAll support.  How do we do select
    // without breaking MDAO optimizations?
    // {
    //   name: 'select',
    //   code: function() {
    //   }
    // },
    // {
    //   name: 'removeAll',
    //   code: function() {
    //   }
    // }
  ]
});
