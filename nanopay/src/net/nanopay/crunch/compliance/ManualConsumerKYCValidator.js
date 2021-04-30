/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.crunch.compliance',
  name: 'ManualConsumerKYCValidator',
  extends: 'net.nanopay.crunch.compliance.AbstractManualValidator',

  documentation: 'Validates a user using the IdentityMind (Acuant) API.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.Map',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.identityMind.IdentityMindResponse',
    'net.nanopay.meter.compliance.identityMind.IdentityMindService'
  ],

  properties: [
    {
      name: 'identityMindUserId',
      class: 'Long',
      value: 1013
    },
    {
      class: 'Int',
      name: 'stage',
      value: 2
    }
  ],

  methods: [
    {
      name: 'generateResponse',
      javaCode: `
        User user = (User) ucj.findSourceId(x);
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        Map <String, Object> memoMap = identityMindService.fetchMemos(x, true, user.getId(), "Dow Jones User");
        IdentityMindResponse response = identityMindService.evaluateConsumer(x, user, getStage(), memoMap);

        ((Logger) x.get("logger")).info("Consumer KYC validation ran for user id: " + user.getId());

        return response;
      `
    },
    {
      name: 'checkResponsePassedCompliance',
      javaCode: `
        IdentityMindResponse identityMindResponse = (IdentityMindResponse) response;
        ComplianceValidationStatus status = identityMindResponse.getComplianceValidationStatus();
        return ( ComplianceValidationStatus.VALIDATED == status );
      `
    },
    {
      name: 'createComplianceApprovalRequest',
      javaCode: `
        IdentityMindResponse identityMindResponse = (IdentityMindResponse) getResponse();
        ComplianceValidationStatus status = identityMindResponse != null ? identityMindResponse.getComplianceValidationStatus() : ComplianceValidationStatus.PENDING;
        User user = (User) ucj.findSourceId(x);

        ComplianceApprovalRequest approvalRequest = new ComplianceApprovalRequest.Builder(x)
          .setObjId(ucj.getId())
          .setDaoKey("userCapabilityJunctionDAO")
          .setRefObjId(user.getId())
          .setRefDaoKey("userDAO")
          .setCreatedFor(user.getId())
          .setCauseId(identityMindResponse != null ? identityMindResponse.getId() : 0L)
          .setCauseDaoKey("identityMindResponseDAO")
          .setClassificationEnum(ApprovalRequestClassificationEnum.MANUAL_USER_IDENTITYMIND)
          .build();

        if ( status == ComplianceValidationStatus.REJECTED ) {
          approvalRequest.setApprover(getIdentityMindUserId());
          approvalRequest.setStatus(ApprovalStatus.REJECTED);
        } else {
          approvalRequest.setGroup(group);
        }

        return approvalRequest;
      `
    }
  ]
});
