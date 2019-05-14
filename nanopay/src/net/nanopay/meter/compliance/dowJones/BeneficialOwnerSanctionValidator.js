foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'BeneficialOwnerSanctionValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a beneficial owner using DowJones Risk and Compliance API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.model.BeneficialOwner'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        BeneficialOwner beneficialOwner = (BeneficialOwner) obj;
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          DowJonesResponse response = dowJonesService.personNameSearch(x, beneficialOwner.getFirstName(), beneficialOwner.getLastName(), null);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! response.getTotalMatches().equals("0") ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            requestApproval(x, response, "dowJonesResponseDAO");
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("BeneficialOwnerSanctionValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
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
