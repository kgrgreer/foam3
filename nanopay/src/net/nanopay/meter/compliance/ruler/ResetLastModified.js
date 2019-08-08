foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ResetLastModified',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: "Reset object's lastModified and lastModifiedBy properties.",

  javaImports: [
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof LastModifiedAware ) {
          ((LastModifiedAware) obj).setLastModified(
            ((LastModifiedAware) oldObj).getLastModified());
        }
        if ( obj instanceof LastModifiedByAware ) {
          ((LastModifiedByAware) obj).setLastModifiedBy(
            ((LastModifiedByAware) oldObj).getLastModifiedBy());
        }
      `
    }
  ]
});
