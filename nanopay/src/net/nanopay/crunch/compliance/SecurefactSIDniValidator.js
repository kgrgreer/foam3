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
  name: 'SecurefactSIDniValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Validates a user using SecureFact SIDni api.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunctionDAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse'
  ],

  properties: [
    {
      name: 'response',
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse'
    },
    {
      name: 'classification',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

        Capability capability = (Capability) ucj.findTargetId(x);
        User user = (User) ucj.saveDataToDAO(x, capability, false);
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
        logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", false). - subject", x.get("subject"));
        logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", false). - user", ((foam.nanos.auth.Subject) x.get("subject")).getUser());
        logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", false). - realuser", ((foam.nanos.auth.Subject) x.get("subject")).getRealUser());
        logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", false). - capability", capability);
        logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", false). - ucj", ucj);
        logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", false). - data", ucj.getData());
        logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", false). - savedObj", user);

        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        try {
          this.setResponse(securefactService.sidniVerify(x, user));
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! getResponse().getVerified() ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                String group = user.getSpid() + "-fraud-ops";
                requestApproval(x,
                  new ComplianceApprovalRequest.Builder(x)
                    .setObjId(ucj.getId())
                    .setDaoKey("userCapabilityJunctionDAO")
                    .setCauseId(getResponse().getId())
                    .setClassificationEnum(ApprovalRequestClassificationEnum.SIGNING_OFFICER_SECUREFACT_SIDNI)
                    .setCauseDaoKey("securefactSIDniDAO")
                    .setCreatedFor(user.getId())
                    .setGroup(group)
                    .build()
                );
              }
            }, "Securefact SIDni Validator");
          }
          ruler.putResult(status);
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("SIDniValidator failed.", e);

          SIDniResponse response = getResponse();
          String group = user.getSpid() + "-fraud-ops";
          requestApproval(x, new ComplianceApprovalRequest.Builder(x)
            .setObjId(ucj.getId())
            .setDaoKey("userCapabilityJunctionDAO")
            .setCauseId(response == null ? 0L : getResponse().getId())
            .setClassificationEnum(ApprovalRequestClassificationEnum.SIGNING_OFFICER_SECUREFACT_SIDNI)
            .setCauseDaoKey("securefactSIDniDAO")
            .setCreatedFor(user.getId())
            .setGroup(group)
            .build());
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
