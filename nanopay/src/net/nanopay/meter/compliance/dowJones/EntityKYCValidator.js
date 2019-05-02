foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'EntityKYCValidator',

  documentation: 'Validates an entity using Dow Jones Risk and Compliance API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  properties: [
    {
      class: 'Int',
      name: 'stage',
      value: 1
    }
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.DowJonesService',
    'net.nanopay.meter.compliance.dowJones.BaseSearchResponse'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          BaseSearchResponse response = dowJonesService.entityNameSearch(x, user.getOrganization(), null);
          ruler.putResult(
            response.getTotalMatches().equals("0")
              ? ComplianceValidationStatus.VALIDATED
              : ComplianceValidationStatus.INVESTIGATING
          );
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("EntityKYCValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.INVESTIGATING);
        }
      `
    }
  ]
});
