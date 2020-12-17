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
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'PruneApprovalRequests',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Remove pending approval requests.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'String',
      name: 'objDaoKey'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ((DAO) x.get("approvalRequestDAO"))
            .where(AND(
              EQ(ApprovalRequest.DAO_KEY, getObjDaoKey()),
              EQ(ApprovalRequest.OBJ_ID, obj.getProperty("id")),
              EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
            .removeAll();
          }
        }, "Prune Approval Requests");
      `
    }
  ]
});
