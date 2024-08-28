/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'IsInstanceOf',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate which checks if objects are instances of the specified class.',
  javaCode: `
public IsInstanceOf(foam.core.ClassInfo targetClass) {
      setTargetClass(targetClass);
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'targetClass',
      javaType: 'foam.core.ClassInfo',
      view: {
        class: 'foam.u2.view.StrategizerChoiceView',
        desiredModelId: 'foam.Class'
      }
    },
    {
      class: 'FObjectProperty',
      javaType: 'foam.mlang.Expr',
      name: 'propExpr'
    }
  ],

  methods: [
    {
      type: 'FObject',
      name: 'fclone',
      javaCode: 'return this;'
    },
    {
      name: 'f',
      code: function f(obj) { return this.propExpr == null || this.propExpr == undefined ? this.targetClass.isInstance(obj) : this.targetClass.isInstance(this.propExpr.f(obj)); },
      javaCode: 'return getPropExpr() == null ? getTargetClass().isInstance(obj) : getTargetClass().isInstance(getPropExpr().f(obj));'
    },
    {
      name: 'toString',
      code: function toString() {
        return foam.String.constantize(this.cls_.name) +
            '(' + this.targetClass.id + ')';
      },
      javaCode: `
        return getClass().getSimpleName() + "(" + getTargetClass().getId() + ")";
      `
    }
  ]
});
