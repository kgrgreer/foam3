foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVValidator',

  documentation: `Validates a business using SecureFact LEV api.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
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
        LEVResponse response = securefactService.levSearch(x, business);
        ruler.putResult(
          response.hasCloseMatches()
            ? ComplianceValidationStatus.VALIDATED
            : ComplianceValidationStatus.INVESTIGATING
        );
      `
    }
  ]
});
