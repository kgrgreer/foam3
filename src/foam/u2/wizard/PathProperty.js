/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'PathProperty',
  extends: 'foam.mlang.ExprProperty',
  implements: [
    'foam.mlang.Expressions',
  ],
  documentation: `
    Represents the path to a property from a known object.

    For example, given this.path as a PathProperty:

    const data = { a: { b: { c: 5 } } }
    this.path$get(this.data);    // 5

    this.path$set(this.data, 7);
    this.data.a.b.c;             // 7
  `,

  requires: [
    'foam.core.Property',
    'foam.mlang.expr.Dot'
  ],

  properties: [
    {
      name: 'adapt',
      value: function (_, o, p) {
        if ( o == null ) return null;
        if ( ! foam.String.isInstance(o) ) return p.adaptValue(o);

        const parts = o.split('.');
        let expr = null;

        for ( let part of parts ) {
          const partialProperty = foam.core.Property.create({
            name: part
          });
          expr = expr ? p.DOT(expr, partialProperty) : partialProperty;
        }
        return expr;

      }
    }
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);

      const prop = this;
      Object.defineProperty(proto, this.name + '$get', {
        configurable: true,
        get: function pathGetter() {
          return function (target) {
            return this[prop.name]?.f(target);
          }
        }
      });

      Object.defineProperty(proto, this.name + '$set', {
        configurable: true,
        get: function pathSetter() {
          return function (target, value) {
            const expr = this[prop.name];
            if ( prop.Property.isInstance(expr) ) {
              target[expr.name] = value;
            } else if ( prop.Dot.isInstance(expr) ) {
              target = expr.arg1.f(target);
              target[expr.arg2.name] = value;
            }
          }
        }
      })
    }
  ]

});
