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
  package: 'net.nanopay.crunch.compliance',
  name: 'ManualSecurefactSIDniValidator',
  extends: 'net.nanopay.crunch.compliance.AbstractManualValidator',

  documentation: `Validates a user using SecureFact SIDni api.`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse'
  ],

  methods: [
    {
      name: 'generateResponse',
      javaCode: `
        User user = (User) ucj.findSourceId(x);
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        return securefactService.sidniVerify(x, user);
      `
    },
    {
      name: 'checkResponsePassedCompliance',
      javaCode: `
        SIDniResponse sidniResponse = (SIDniResponse) response;
        return sidniResponse.getVerified();
      `
    },
    {
      name: 'createComplianceApprovalRequest',
      javaCode: `
        SIDniResponse sidniResponse = (SIDniResponse) getResponse();
        User user = (User) ucj.findSourceId(x);

        return new ComplianceApprovalRequest.Builder(x)
          .setObjId(ucj.getId())
          .setDaoKey("userCapabilityJunctionDAO")
          .setRefObjId(user.getId())
          .setRefDaoKey("userDAO")
          .setCauseId(sidniResponse != null ? sidniResponse.getId() : 0L)
          .setClassificationEnum(ApprovalRequestClassificationEnum.MANUAL_USER_SECUREFACT_SIDNI)
          .setCauseDaoKey("securefactSIDniDAO")
          .setCreatedFor(user.getId())
          .setGroup(group)
          .build();
      `
    }
  ]
});
