foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniValidator',

  documentation: `Validates a user using SecureFact SIDni api.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniResponse'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        try {
          SIDniResponse response = securefactService.sidniVerify(x, user);
          ruler.putResult(
            response.getVerified()
              ? ComplianceValidationStatus.VALIDATED
              : ComplianceValidationStatus.INVESTIGATING
          );
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("SIDniValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.INVESTIGATING);
        }
      `
    }
  ]
});
