foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'PersonKYCValidator',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

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
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          DowJonesResponse response = dowJonesService.personNameSearch(x, user.getFirstName(), user.getLastName(), null);
          ruler.putResult(
            response.getTotalMatches().equals("0")
              ? ComplianceValidationStatus.VALIDATED
              : ComplianceValidationStatus.INVESTIGATING
          );
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("PersonKYCValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.INVESTIGATING);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    }
  ]
});
