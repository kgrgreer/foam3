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
    'foam.i18n.TranslationService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.model.Business',
  ],

  properties: [
    {
      name: 'classification',
      class: 'String'
    }
  ],

  messages: [
    { name: 'CLASSIFICATION_MSG', message: 'Generic Business Validator' }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            Business business = (Business) ucj.findSourceId(x);

            String group = business.getSpid() + "-fraud-ops";

            Subject subject = (Subject) x.get("subject");
            String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
            TranslationService ts = (TranslationService) x.get("translationService");
            String classification = ts.getTranslation(locale, getClassInfo().getId() + ".CLASSIFICATION_MSG", CLASSIFICATION_MSG);

            requestApproval(x,
              new ComplianceApprovalRequest.Builder(x)
                .setObjId(ucj.getId())
                .setDaoKey("userCapabilityJunctionDAO")
                .setRefObjId(business.getId())
                .setRefDaoKey("businessDAO")
                .setCreatedFor(business.getId())
                .setClassification(classification)
                .setGroup(group)
                .build()
            );
          }
        }, "Generic Business Validator");
      `
    }
  ]
});
