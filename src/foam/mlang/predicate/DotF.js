/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'DotF',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: `A binary predicate that evaluates arg1 as a predicate with
    arg2 as its argument.`,

  javaImports: [
    'static foam.core.ContextAware.maybeContextualize'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Object predicate = getArg1().f(obj);
        if ( predicate instanceof Predicate ) {
          maybeContextualize(getX(), predicate);
          return ((Predicate) predicate).f(getArg2().f(obj));
        }
        return false;
      `,
      code: function(o) {
        const predicate = this.arg1.f(o);
        if ( foam.mlang.predicate.Predicate.isInstance(predicate) ) {
          return predicate.f(this.arg2.f(o));
        }
        return false;
      }
    },
    {
      name: 'deepClone',
      type: 'FObject',
      javaCode: 'return this;'
    }
  ]
});
