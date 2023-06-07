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
        try { setCachedClass_(Class.forName(val)); }
        catch (Exception E) { return; }
      `
    },
    {
      class: 'Object',
      name: 'cachedClass_',
      visibility: 'HIDDEN',
      transient: true,
      documentation: 'cached class',
      javaFactory: `
        try { return Class.forName(getOf()); }
        catch (Exception E) { }
        return null;
      `
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
        if ( getIsNew() ) {
          FObject nu  = (FObject) NEW_OBJ.f(obj);
          return ((Class) getCachedClass_()).isInstance(nu.getProperty(getPropName()));
        }
        FObject old = (FObject) OLD_OBJ.f(obj);
        if ( old != null )
          return ((Class) getCachedClass_()).isInstance(old.getProperty(getPropName()));
        return false;
      `
    }
  ]
});
