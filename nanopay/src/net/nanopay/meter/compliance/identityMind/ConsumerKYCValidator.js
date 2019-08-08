foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ConsumerKYCValidator',
  extends: 'net.nanopay.meter.compliance.identityMind.AbstractIdentityMindComplianceRuleAction',

  documentation: 'Validates a user using IdentityMind Consumer KYC Evaluation API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'java.util.Map',
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
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            // NOTE: Casting can fail since obj can also be a BeneficialOwner object
            // as it is also used by beneficial owner KYC rule (id:1431).
            User user = (User) obj;
            IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
            Map <String, Object> memoMap = fetchMemos(x, true, user.getId(), "Dow Jones Person");
            IdentityMindResponse response = identityMindService.evaluateConsumer(x, obj, getStage(), memoMap);
            ComplianceValidationStatus status = response.getComplianceValidationStatus();

            if ( obj instanceof User ) {
              requestApproval(x,
                new ComplianceApprovalRequest.Builder(x)
                  .setObjId(String.valueOf(obj.getProperty("id")))
                  .setDaoKey("localUserDAO")
                  .setCauseId(response.getId())
                  .setCauseDaoKey("identityMindResponseDAO")
                  .setStatus(getApprovalStatus(status))
                  .setApprover(getApprover(status))
                  .setClassification("Validate User Using IdentityMind")
                  .build()
              );
            }
            ruler.putResult(status);
          }
        }, "Consumer KYC Validator");
      `
    }
  ]
});
