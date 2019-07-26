foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'MerchantKYCValidator',
  extends: 'net.nanopay.meter.compliance.identityMind.AbstractIdentityMindComplianceRuleAction',

  documentation: 'Validates a business using IdentityMind Merchant KYC Evaluation API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'java.util.Map',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Business business = (Business) obj;
            IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
            Map <String, Object> memoMap = fetchMemos(x, false, business.getId(), "Dow Jones Entity");
            IdentityMindResponse response = identityMindService.evaluateMerchant(x, business, memoMap);
            ComplianceValidationStatus status = response.getComplianceValidationStatus();

            requestApproval(x,
              new ComplianceApprovalRequest.Builder(x)
                .setObjId(Long.toString(business.getId()))
                .setDaoKey("localUserDAO")
                .setCauseId(response.getId())
                .setCauseDaoKey("identityMindResponseDAO")
                .setStatus(getApprovalStatus(status))
                .setApprover(getApprover(status))
                .setClassification("Validate Business Using IdentityMind")
                .build()
            );
            ruler.putResult(status);
          }
        });
      `
    }
  ]
});
