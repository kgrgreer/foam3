foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'PathProperty',
  extends: 'foam.mlang.ExprProperty',
  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.core.Property',
    'foam.mlang.expr.Dot'
  ],

  documentation: `
    Represents the path to a property from a known object.
  `,

  properties: [
    {
      name: 'adapt',
      value: function (_, o, p) {
        if ( typeof o !== 'string'  ) return p.adaptValue(o);

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
        get: function pathGetter() {
          return function (target) {
            return this[prop.name].f(target);
          }
        }
      });

      Object.defineProperty(proto, this.name + '$set', {
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
