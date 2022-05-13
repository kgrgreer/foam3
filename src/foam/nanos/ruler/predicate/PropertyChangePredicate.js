/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyChangePredicate',

  documentation: 'A predicate that returns true when a specific property has changed. This predicate expects to be able to pull the old and new object out of the context to do this check.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'static foam.mlang.MLang.NEW_OBJ',
    'static foam.mlang.MLang.OLD_OBJ'
  ],
  properties: [
    {
      class: 'String',
      name: 'propName'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var nu  = NEW_OBJ.f(obj);
        var old = OLD_OBJ.f(obj);
        var prop = (PropertyInfo) ((FObject) nu)
          .getClassInfo().getAxiomByName(getPropName());

        return old != null && nu != null
          && prop != null && prop.compare(nu, old) != 0;
      `
    }
  ]
});
