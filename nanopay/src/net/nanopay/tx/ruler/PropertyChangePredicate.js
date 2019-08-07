foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'PropertyChangePredicate',

  documentation: 'Predicate for observing a property',

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

    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
       FObject nu  = (FObject) NEW_OBJ.f(obj);
       FObject old = (FObject) OLD_OBJ.f(obj);
       return ( old != null && nu != null &&  ! foam.util.SafetyUtil.equals( nu.getProperty(getPropName()),old.getProperty(getPropName()) ) );
      `
    }
  ]
});
