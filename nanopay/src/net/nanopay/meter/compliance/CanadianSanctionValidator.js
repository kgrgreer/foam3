foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'CanadianSanctionValidator',

  documentation: `Validator that checks user and business against
    the Consolidated Canadian Autonomous Sanctions List.

    URL: https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.canadianSanction.Record',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        Predicate predicate = user instanceof Business
          ? new ContainsIC.Builder(x)
            .setArg1(MLang.prepare(Record.ENTITY))
            .setArg2(MLang.prepare(user.getBusinessName()))
            .build()
          // TODO: Add support for fuzzy string matching for name search
          : MLang.AND(
              MLang.EQ(Record.LAST_NAME, user.getLastName().toUpperCase()),
              MLang.EQ(Record.GIVEN_NAME, user.getFirstName().toUpperCase())
            );
        Count found = (Count) ((DAO) x.get("canadianSanctionDAO"))
          .where(predicate).limit(1).select(new Count());

        if ( found.getValue() == 0 ) {
          ruler.putResult(ComplianceValidationStatus.VALIDATED);
          return;
        }
        user.setCompliance(ComplianceStatus.FAILED);
        ruler.putResult(ComplianceValidationStatus.REJECTED);
        ruler.stop();
      `
    }
  ]
});
