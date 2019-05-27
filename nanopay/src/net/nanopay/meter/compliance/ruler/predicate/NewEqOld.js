foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'NewEqOld',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if NEW_OBJ equals OLD_OBJ.',

  javaImports: [
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: 'return EQ(NEW_OBJ, OLD_OBJ).f(obj);'
    }
  ]
});
