/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'IsClassOf',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate which checks if the class of object is a specified class.',

  javaCode: `
  public IsClassOf(foam.core.ClassInfo targetClass) {
    setTargetClass(targetClass);
  }
  `,

  properties: [
    {
      class: 'Class',
      name: 'targetClass',
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
      name: 'f',
      code: function(obj) {
        return this.propExpr == null || this.propExpr == undefined ? this.targetClass.id == obj.cls_.id : this.targetClass.id == this.propExpr.f(obj).cls_.id;
      },
      javaCode: `
      return getPropExpr() == null ? getTargetClass().getObjClass() == obj.getClass() : getTargetClass().getObjClass() == getPropExpr().f(obj).getClass();
      `
    },
    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.targetClass.id + ')';
    }
  ]
});
