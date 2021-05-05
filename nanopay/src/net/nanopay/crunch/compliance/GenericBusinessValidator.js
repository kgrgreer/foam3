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
  name: 'GenericBusinessValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a business by sending an approval request to fraudops.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.mlang.sink.Count',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'classification',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO                userDAO            = (DAO)                x.get("userDAO");
            DAO                approvalRequestDAO = (DAO)                x.get("approvalRequestDAO");
            Subject            subject            = (Subject)            x.get("subject");
            TranslationService ts                 = (TranslationService) x.get("translationService");

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            Business business = (Business) userDAO.find(((AgentCapabilityJunction) ucj).getEffectiveUser());

            String group = business.getSpid() + "-fraud-ops";

            Long count = (Long) ((Count) approvalRequestDAO.where(AND(
              EQ(ComplianceApprovalRequest.OBJ_ID, ucj.getId()),
              EQ(ComplianceApprovalRequest.DAO_KEY, "userCapabilityJunctionDAO"),
              EQ(ComplianceApprovalRequest.CLASSIFICATION_ENUM, ApprovalRequestClassificationEnum.GENERIC_BUSINESS_VALIDATOR),
              EQ(ComplianceApprovalRequest.STATUS, foam.nanos.approval.ApprovalStatus.REQUESTED)
            )).select(COUNT())).getValue();

            if ( count > 0 ) return;

            requestApproval(x,
              new ComplianceApprovalRequest.Builder(x)
                .setObjId(ucj.getId())
                .setDaoKey("userCapabilityJunctionDAO")
                .setRefObjId(ucj.getId())
                .setRefDaoKey("userCapabilityJunctionDAO")
                .setCreatedFor(business.getId())
                .setClassificationEnum(ApprovalRequestClassificationEnum.GENERIC_BUSINESS_VALIDATOR)
                .setGroup(group)
                .build()
            );
          }
        }, "Generic Business Validator");
      `
    }
  ]
});
