/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Map',
  extends: 'foam.dao.ProxySink',

  documentation: 'Sink Decorator which applies a map function to put() values before passing to delegate.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      type: 'Any',
      args: [ { name: 'obj', type: 'Any' } ],
      code: function f(obj) { return this.arg1.f(obj); },
      swiftCode: `return arg1?.f(obj)`,
      javaCode: `return getArg1().f(obj);`
    },

    {
      name: 'put',
      code: function put(o, sub) { this.delegate.put(this.f(o), sub); },
      swiftCode: `delegate.put(f(obj)!, sub)`,
      javaCode: 'getDelegate().put(f(obj), sub);'
    },

    function toString() {
      return 'MAP(' + this.arg1.toString() + ',' + this.f.toString() + ')';
    }
  ]
});
