foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'MerchantKYCValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a business using IdentityMind Merchant KYC Evaluation API.',

  javaImports: [
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.evaluateMerchant(x, business);
        ComplianceValidationStatus status = response.getComplianceValidationStatus();

        if ( status != ComplianceValidationStatus.VALIDATED ) {
          requestApproval(x,
            new ComplianceApprovalRequest.Builder(x)
              .setObjId(Long.toString(business.getId()))
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
