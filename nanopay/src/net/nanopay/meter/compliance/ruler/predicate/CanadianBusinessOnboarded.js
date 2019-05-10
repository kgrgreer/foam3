foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'CanadianBusinessOnboarded',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        Business business = (Business) NEW_OBJ.f(obj);
        Address address = business.getAddress();

        return address != null
          && address.getCountryId().equals("CA")
          && business.getOnboarded()
          && ComplianceStatus.REQUESTED == business.getCompliance();
      `
    }
  ]
});
