foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVValidator',

  documentation: `Validates a business using SecureFact LEV api.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.lev.model.LEVResponse',
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
          ruler.putResult(
            response.hasCloseMatches()
              ? ComplianceValidationStatus.VALIDATED
              : ComplianceValidationStatus.INVESTIGATING
          );
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("LEVValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.INVESTIGATING);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ' '
    }
  ]
});
