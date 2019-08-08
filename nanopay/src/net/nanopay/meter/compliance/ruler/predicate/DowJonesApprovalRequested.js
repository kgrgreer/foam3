foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'DowJonesApprovalRequested',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if approval request is of type DowJonesApprovalRequest',

  javaImports: [
    'net.nanopay.meter.compliance.dowJones.DowJonesApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(DOT(NEW_OBJ, INSTANCE_OF(DowJonesApprovalRequest.class)), true).f(obj);
      `
    }
  ]
});
