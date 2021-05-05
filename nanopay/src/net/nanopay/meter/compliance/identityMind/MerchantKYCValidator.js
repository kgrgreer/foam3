/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'MerchantKYCValidator',
  extends: 'net.nanopay.meter.compliance.identityMind.AbstractIdentityMindComplianceRuleAction',

  documentation: 'Validates a business using IdentityMind Merchant KYC Evaluation API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
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
            Map <String, Object> memoMap = identityMindService.fetchMemos(x, false, business.getId(), "Dow Jones Entity");
            IdentityMindResponse response = identityMindService.evaluateMerchant(x, business, memoMap);
            ComplianceValidationStatus status = response.getComplianceValidationStatus();

            requestApproval(x,
              new ComplianceApprovalRequest.Builder(x)
                .setObjId(business.getId())
                .setDaoKey("userDAO")
                .setServerDaoKey("localUserDAO")
                .setCauseId(response.getId())
                .setCauseDaoKey("identityMindResponseDAO")
                .setStatus(getApprovalStatus(status))
                .setApprover(getApprover(status))
                .setCreatedFor(business.getId())
                .setClassificationEnum(ApprovalRequestClassificationEnum.BUSINESS_IDENTITYMIND_MERCHANT_KYC)
                .build()
            );
            ruler.putResult(status);
          }
        }, "Merchant KYC Validator");
      `
    }
  ]
});
