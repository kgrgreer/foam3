/**
 * @license
 * Copyright 2016 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ArrayDAO',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'DAO implementation backed by an array.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.ArraySink',
    'foam.mlang.Expr',
    'foam.mlang.predicate.Predicate',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Comparator',
    'java.util.List'
  ],

  requires: [
    'foam.dao.ArraySink',
    'foam.mlang.predicate.True'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      factory: function() {
        return this.array.length === 0 ? this.__context__.lookup('foam.core.FObject') : null;
      },
      hidden: true
    },
    {
      class: 'List',
      of: 'foam.core.FObject',
      name: 'array',
      factory: function() { return []; },
      javaFactory: 'return new ArrayList();',
      transient: true,
      hidden: true
    },
    {
      documentation: 'Property for comparing. Defaults to ID. Intented to support models without an id property.',
      class: 'foam.mlang.ExprProperty',
      name: 'identityExpr',
      javaType: 'foam.mlang.Expr',
      factory: function(of) { return of.model_.ID; },
      javaFactory: 'return new foam.mlang.IdentityExpr();',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        for ( var i = 0 ; i < this.array.length ; i++ ) {
          if ( obj.compareTo(this.identityExpr.f(this.array[i])) === 0 ) {
            this.array[i] = obj;
            break;
          }
        }
        if ( i == this.array.length ) this.array.push(obj);
        this.on.put.pub(obj);

        return Promise.resolve(obj);
      },
      javaCode: `
        getArray().add(obj);
        return obj;
      `
    },
    {
      name: 'remove_',
      code: function(x, obj) {
        // written by OpenAI
        for ( var i = 0 ; i < this.array.length ; i++ ) {
          if ( obj.compareTo(this.identityExpr.f(this.array[i])) === 0 ) {
            this.array.splice(i, 1);
            break;
          }
        }

        this.on.remove.pub(obj);

        return Promise.resolve(obj);
      },
      javaCode: `
        ((List)getArray()).remove(obj);
        return obj;
      `
    },

    {
      name: 'select_',
      code: function(x, sink, skip, limit, order, predicate) {
        var resultSink = sink || this.ArraySink.create({ of: this.of });

        sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

        var detached = false;
        var sub = foam.core.FObject.create();
        sub.onDetach(function() { detached = true; });

        var self = this;

        return new Promise(function(resolve, reject) {
          for ( var i = 0 ; i < self.array.length ; i++ ) {
            if ( detached ) break;

            sink.put(self.array[i], sub);
          }

          sink.eof();

          resolve(resultSink);
        });
      },
      javaCode: `
      Sink resultSink = prepareSink(sink);
      sink = decorateSink(x, resultSink, skip, limit, order, predicate);
      for ( Object o : getArray() ) {
        sink.put(o, null);
      }
      return resultSink;
      `
    },
    {
      name: 'removeAll_',
      code: function(x, skip, limit, order, predicate) {
        predicate = predicate || this.True.create();
        skip = skip || 0;
        limit = foam.Number.isInstance(limit) ? limit : Number.MAX_VALUE;

        for ( var i = 0 ; i < this.array.length && limit > 0 ; i++ ) {
          if ( predicate.f(this.array[i]) ) {
            if ( skip > 0 ) {
              skip--;
              continue;
            }
            var obj = this.array.splice(i, 1)[0];
            i--;
            limit--;
            this.on.remove.pub(obj);
          }
        }

        return Promise.resolve();
      }
    },
    {
      name: 'find_',
      code: function(x, key) {
        // Predicate handled in AbstractDAO
        if ( this.of.isInstance(key) ) {
          var expr = this.identityExpr
          for ( var i = 0 ; i < this.array.length ; i++ ) {
            if ( foam.util.equals(id.f(this.array[i])) ) {
              return Promise.resolve(this.array[i]);
            }
          }
        } else {
          var id = this.of.isInstance(key) ? key.id : key;
          for ( var i = 0 ; i < this.array.length ; i++ ) {
            if ( foam.util.equals(id, this.array[i].id) ) {
              return Promise.resolve(this.array[i]);
            }
          }
        }
        return Promise.resolve(null);
      },
      javaCode: `
      // Predicate handled in AbstractDAO
      Expr identity = getIdentityExpr();
      Object val = id instanceof FObject ? identity.f(id) : id;
      for ( Object o : getArray() ) {
        if ( SafetyUtil.equals(identity.f(o), val) ) return (FObject) o;
      }
      return null;
      `
    }
  ]
});
