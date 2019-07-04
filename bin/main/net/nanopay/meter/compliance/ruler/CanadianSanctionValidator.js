foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'CanadianSanctionValidator',

  documentation: `Validator that checks user and business against
    the Consolidated Canadian Autonomous Sanctions List.

    URL: https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.canadianSanction.Record',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        Predicate predicate = user instanceof Business
          ? new ContainsIC.Builder(x)
            .setArg1(prepare(Record.ENTITY))
            .setArg2(prepare(user.getBusinessName()))
            .build()
          : AND(
              EQ(Record.LAST_NAME, user.getLastName().toUpperCase()),
              EQ(Record.GIVEN_NAME, user.getFirstName().toUpperCase())
            );
        Count found = (Count) ((DAO) x.get("canadianSanctionDAO"))
          .where(predicate).limit(1).select(new Count());

        if ( found.getValue() == 1 ) {
          String message = String.format(
            "%s : The %s name was found in the Canadian sanction list."
            , getClass().getSimpleName()
            , user instanceof Business ? "business" : "individual");
          ruler.putResult(message);
          user.setCompliance(ComplianceStatus.FAILED);
        }
      `
    }
  ]
});
