foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'SecurefactSIDniValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Validates a user using SecureFact SIDni api.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        try {
          SIDniResponse response = securefactService.sidniVerify(x, user);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! response.getVerified() ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new ComplianceApprovalRequest.Builder(x)
                    .setObjId(Long.toString(user.getId()))
                    .setDaoKey("localUserDAO")
                    .setCauseId(response.getId())
                    .setClassification("Validate User Using SecureFact")
                    .setCauseDaoKey("securefactSIDniDAO")
                    .build()
                );
              }
            }, "Securefact SIDni Validator");
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("SIDniValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
