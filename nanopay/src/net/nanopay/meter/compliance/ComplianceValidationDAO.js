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
        FObject oldObj = this.find_(x, obj);

        if ( oldObj == null
          || ! obj.diff(oldObj).containsKey("compliance")
          && getPredicate().test(oldObj, obj)
        ) {
          ((ComplianceService) x.get("complianceService")).validate(getX(), obj);
        }
        return super.put_(x, obj);
      `
    },
  ]
});
