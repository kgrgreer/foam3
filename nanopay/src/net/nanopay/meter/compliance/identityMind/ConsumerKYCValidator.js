foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ConsumerKYCValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a user using IdentityMind Consumer KYC Evaluation API.',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus'
  ],

  properties: [
    {
      class: 'Int',
      name: 'stage',
      value: 1
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.evaluateConsumer(
          x, obj, getStage());
        ComplianceValidationStatus status = response.getComplianceValidationStatus();

        if ( obj instanceof User
          && status != ComplianceValidationStatus.VALIDATED
        ) {
          requestApproval(x,
            new ComplianceApprovalRequest.Builder(x)
              .setObjId(String.valueOf(obj.getProperty("id")))
              .setDaoKey("localUserDAO")
              .setCauseId(response.getId())
              .setCauseDaoKey("identityMindResponseDAO")
              .build()
          );
        }
        ruler.putResult(status);
      `
    }
  ]
});
