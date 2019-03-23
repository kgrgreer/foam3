foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniValidator',

  documentation: `Validates a user using SecureFact SIDni api.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.auth.User',
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
        SIDniResponse response = securefactService.sidniVerify(x, user);
        ruler.putResult(
          response.getVerified()
            ? ComplianceValidationStatus.VALIDATED
            : ComplianceValidationStatus.INVESTIGATING
        );
      `
    }
  ]
});
