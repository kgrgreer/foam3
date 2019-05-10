foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'BeneficialOwnerKYCValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a beneficial owner using DowJones Risk and Compliance API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.model.BeneficialOwner',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.DowJonesService',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        // add date of birth and country to beneficial owner request
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
          ((Logger) x.get("logger")).warning("BeneficialOwnerKYCValidator failed.", e);
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
