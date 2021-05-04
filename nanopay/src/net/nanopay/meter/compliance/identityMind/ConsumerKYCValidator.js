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
  name: 'ConsumerKYCValidator',
  extends: 'net.nanopay.meter.compliance.identityMind.AbstractIdentityMindComplianceRuleAction',

  documentation: 'Validates a user using IdentityMind Consumer KYC Evaluation API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
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
            Map <String, Object> memoMap = identityMindService.fetchMemos(x, true, user.getId(), "Dow Jones User");
            IdentityMindResponse response = identityMindService.evaluateConsumer(x, obj, getStage(), memoMap);
            ComplianceValidationStatus status = response.getComplianceValidationStatus();

            if ( obj instanceof User ) {
              requestApproval(x,
                new ComplianceApprovalRequest.Builder(x)
                  .setObjId(obj.getProperty("id"))
                  .setDaoKey("userDAO")
                  .setServerDaoKey("localUserDAO")
                  .setCauseId(response.getId())
                  .setCauseDaoKey("identityMindResponseDAO")
                  .setStatus(getApprovalStatus(status))
                  .setApprover(getApprover(status))
                  .setCreatedFor(user.getId())
                  .setClassificationEnum(ApprovalRequestClassificationEnum.USER_IDENTITYMIND_CONSUMER_KYC)
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
