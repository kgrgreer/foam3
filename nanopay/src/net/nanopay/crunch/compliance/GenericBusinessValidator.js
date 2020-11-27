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
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.model.Business',
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
            Business business = (Business) ucj.findSourceId(x);

            String group = business.getSpid() + "-fraud-ops";

            requestApproval(x,
              new ApprovalRequest.Builder(x)
                .setObjId(ucj.getId())
                .setDaoKey("userCapabilityJunctionDAO")
                .setRefObjId(business.getId())
                .setRefDaoKey("businessDAO")
                .setClassification(getClassification())
                .setGroup(group)
                .build()
            );
          }
        }, "Generic Business Validator");
      `
    }
  ]
});
