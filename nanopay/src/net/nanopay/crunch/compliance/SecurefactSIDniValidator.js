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
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunctionDAO',
    'foam.nanos.logger.Logger',
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
    }
  ],  

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        UserCapabilityJunctionDAO ucjDAO = new UserCapabilityJunctionDAO.Builder(x).build();

        Capability capability = (Capability) ucj.findTargetId(x);
        User user = (User) ucjDAO.saveDataToDAO(x, capability, ucj, false);

        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        try {
          this.setResponse(securefactService.sidniVerify(x, user));
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! getResponse().getVerified() ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new ComplianceApprovalRequest.Builder(x)
                    .setEntityId(user.getId())
                    .setObjId(ucj.getId())
                    .setDaoKey("userCapabilityJunctionDAO")
                    .setCauseId(getResponse().getId())
                    .setClassification("Validate Signing Officer UserCapabilityJunction Using SecureFact")
                    .setCauseDaoKey("securefactSIDniDAO")
                    .build()
                );
              }
            }, "Securefact SIDni Validator");
          }
          ruler.putResult(status);
        } catch (Exception e) {
          SIDniResponse response = getResponse();
          requestApproval(x, new ComplianceApprovalRequest.Builder(x)
            .setEntityId(user.getId())
            .setObjId(ucj.getId())
            .setDaoKey("userCapabilityJunctionDAO")
            .setCauseId(response == null ? 0L : getResponse().getId())
            .setClassification("Validate Signing Officer UserCapabilityJunction Using SecureFact")
            .setCauseDaoKey("securefactSIDniDAO")
            .build());
          ((Logger) x.get("logger")).warning("SIDniValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
