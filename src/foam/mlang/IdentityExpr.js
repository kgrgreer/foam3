/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'IdentityExpr',
  extends: 'foam.mlang.AbstractExpr',
  axioms: [
    { class: 'foam.pattern.Singleton' }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) {
        return o.model_.ID && o.model_ID.get(o) || o;
      },
      javaCode: `
      if ( obj instanceof foam.core.FObject ) {
        foam.core.PropertyInfo id = (foam.core.PropertyInfo) ((foam.core.FObject) obj).getClassInfo().getAxiomByName("id");
        if ( id != null ) return id.get(obj);
      }
      return obj;
      `
    }
  ]
});
