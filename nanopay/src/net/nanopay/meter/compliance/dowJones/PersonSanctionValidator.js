foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'PersonSanctionValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
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
        // add date of birth and country to person request
        User user = (User) obj;
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          DowJonesResponse response = dowJonesService.personNameSearch(x, user.getFirstName(), user.getLastName(), null);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! response.getTotalMatches().equals("0") ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            requestApproval(x, response, "dowJonesResponseDAO");
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("PersonSanctionValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.INVESTIGATING);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    },
    {
      name: 'canExecute',
      javaCode: `
      // TODO: add an actual implementation
      return true;
      `
    },
    {
      name: 'describe',
      javaCode: `
      // TODO: add an actual implementation
      return "";
      `
    }
  ]
});
