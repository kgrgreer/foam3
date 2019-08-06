foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'ObservePredicate',

  documentation: 'Predicate for observing a property',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'static foam.mlang.MLang.*',
  ],
  properties: [
    {
      name: 'observedProperty',
      class: 'String'
    },
    {
      name: 'observedClass',
      class: 'Class'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
       FObject nu  = (FObject) NEW_OBJ.f(obj);
       FObject old = (FObject) OLD_OBJ.f(obj);
       return ( getObservedClass().isInstance(nu) &&  ( nu.getProperty(getObservedProperty()) != old.getProperty(getObservedProperty()) ) );
      `
    }
  ]
});
