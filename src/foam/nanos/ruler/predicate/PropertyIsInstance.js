/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.predicate',
  name: 'PropertyIsInstance',

  documentation: 'Returns true if property propName is instanceof of. uses string instead of class, to allow checking instance of interfaces',

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
      name: 'of',
      documentation: 'class that we want the object to be an instance of, if changed, nullify cache',
      javaPreSet: `
        setCachedClass_(null);
      `
    },
    {
      class: 'Object',
      name: 'cachedClass_',
      documentation: 'cached class',
      value: null
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
      if ( getCachedClass_() != null ) {
        cls = (Class) getCachedClass_();
      }
      else {
        try {
          cls = Class.forName(getOf());
          setCachedClass_(cls);
        }
        catch (Exception E) {
          return false; // unable to find class
        };
      }
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
