/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyImplements',

  documentation: 'Returns true if property propName is instanceof of',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*'
  ],
  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'String',
      name: 'ofInterface',
      documentation: 'interface that we want the object to be an instance of'
    },
    {
      class: 'Boolean',
      name: 'isNew',
      value: true
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
      Class cls;
      try {
        cls = Class.forName(getOfInterface());
      }
      catch (Exception E) {
        return false; // unable to find class
      };

      if ( getIsNew() ) {
        FObject nu  = (FObject) NEW_OBJ.f(obj);
        return cls.isInstance(nu.getProperty(getPropName()));
      }
      FObject old = (FObject) OLD_OBJ.f(obj);
      if ( old != null )
        return cls.isInstance(old.getProperty(getPropName()));
      return false;
      `
    }
  ]
});

