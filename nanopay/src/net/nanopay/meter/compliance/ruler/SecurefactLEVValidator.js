foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'SecurefactLEVValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Validates a business using SecureFact LEV api.`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        try {
          LEVResponse response = securefactService.levSearch(x, business);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! response.hasCloseMatches() ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            requestApproval(x, response, "securefactLEVDAO");
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("LEVValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    }
  ]
});
