foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceValidationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that runs compliance validation on object
    being saved.
    
    It first runs test on a given predicate and only validates object for
    compliance when the predicate returns true. If no predicate is provided,
    default predicate that always return true will be used.`,

  javaImports: [
    'foam.core.FObject'
  ],

  properties: [
    {
      class: 'Object',
      name: 'predicate',
      javaType: 'net.nanopay.meter.compliance.CompliancePredicate',
      javaFactory: `
        return new CompliancePredicate() {
          @Override
          public boolean test(FObject oldObj, FObject newObj) {
            return true;
          }
        };
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        FObject oldObj = find_(x, obj);

        if ( oldObj == null
          // Only run compliance service when "compliance" prop is not updated.
          || ! obj.diff(oldObj).containsKey("compliance")
          && getPredicate().test(oldObj, obj)
        ) {
          // TODO: Cancel any outstanding compliance checks if an object is removed
          ((ComplianceService) x.get("complianceService")).validate(getX(), obj);
        }
        return super.put_(x, obj);
      `
    },
  ]
});
