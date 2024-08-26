/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'OlderThan',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],
  properties: [
    {
      class: 'Long',
      name: 'timeMs'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        return v1 && Date.now() - v1.getTime() > this.timeMs;
      },
      javaCode: `
        Object v1 = getArg1().f(obj);
        if ( v1 instanceof java.util.Date ) {
          return new java.util.Date().getTime() - ((java.util.Date)v1).getTime() > getTimeMs();
        }
        return false;
      `
    }
  ]
});
