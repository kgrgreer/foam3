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
  name: 'GenericSigningOfficerValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a signing officer by sending an approval request to fraudops',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.approval.ApprovalRequest'
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
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            Capability capability = (Capability) ucj.findTargetId(x);
            User user = (User) ucj.saveDataToDAO(x, capability, false);

            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");            
            logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - subject", x.get("subject"));
            logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - user", ((foam.nanos.auth.Subject) x.get("subject")).getUser());
            logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - realuser", ((foam.nanos.auth.Subject) x.get("subject")).getRealUser());
            logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - capability", capability);
            logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - ucj", ucj);
            logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - data", ucj.getData());
            logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - savedObj", user);
            String group = user.getSpid() + "-fraud-ops";

            requestApproval(x,
              new ApprovalRequest.Builder(x)
                .setClassification(getClassification())
                .setDescription("A user wishes to be a signing officer " +
                  "Please review whether they should be given this capability ")
                .setDaoKey("userCapabilityJunctionDAO")
                .setObjId(ucj.getId())
                .setCreatedFor(user.getId())
                .setGroup(group)
              .build()
            );
          }
        }, "Generic Signing Officer Validator");
      `
    }
  ]
});
