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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessApprovalRequestRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Creates an approval request when an AFEX Business is created.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalStatus',
  ],

  messages: [
   { name: 'DESCRIPTION', message: 'Approve AFEX business to enable international payments' }
 ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AFEXUser afexUser = (AFEXUser) obj;
            DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
            User user = afexUser.findUser(x);
            String spid = user.getSpid();
            String group = spid + "-payment-ops";

            TranslationService ts = (TranslationService) x.get("translationService");
            Subject subject = (Subject) x.get("subject");
            String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
            String description = ts.getTranslation(locale, getClassInfo().getId() + ".DESCRIPTION", DESCRIPTION);

            approvalRequestDAO.put_(x,
              new AFEXBusinessApprovalRequest.Builder(x)
                .setDaoKey("afexUserDAO")
                .setObjId(afexUser.getId())
                .setClassificationEnum(ApprovalRequestClassificationEnum.AFEX_BUSINESS)
                .setDescription(description)
                .setGroup(group)
                .setCreatedFor(user.getId())
                .setStatus(ApprovalStatus.REQUESTED).build());
          }
        }, "Create AFEXBusiness Approval Request Rule");
      `
    }
  ]
 });
