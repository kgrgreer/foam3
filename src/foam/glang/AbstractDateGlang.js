/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'AbstractDateGlang',
  extends: 'foam.mlang.AbstractExpr',
  abstract: true,
  requires: [
    'foam.mlang.IdentityExpr',
  ],
  implements: [
    'foam.core.Serializable',
    'foam.mlang.order.Comparator',
  ],
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'delegate',
      factory: function() { return this.IdentityExpr.create() }
    }
  ],
  methods: [
    {
      name: 'createStatement',
      javaCode: 'return "";'
    },
    {
      name: 'prepareStatement',
      javaCode: '// noop'
    },
    {
      name: 'compare',
      code: function(o1, o2) {
        return foam.Date.compare(this.f(o1), this.f(o2));
      },
      javaCode: `
        java.util.Date date1 = (java.util.Date) f(o1);
        java.util.Date date2 = (java.util.Date) f(o2);
        return date1.compareTo(date2);
      `
    }
  ]
});
