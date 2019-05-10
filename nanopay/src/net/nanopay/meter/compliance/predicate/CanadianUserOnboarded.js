foam.CLASS({
  package: 'net.nanopay.meter.compliance.predicate',
  name: 'CanadianUserOnboarded',
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
        User user = (User) NEW_OBJ.f(obj);
        Address address = user.getAddress();

        return address != null
          && address.getCountryId().equals("CA")
          && user.getClass() == User.class
          && ComplianceStatus.REQUESTED == user.getCompliance();
      `
    }
  ]
});
