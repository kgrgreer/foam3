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
  name: 'UserComplianceApproval',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance according to approval.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            DAO dao = ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, "userCapabilityJunctionDAO"),
                EQ(ApprovalRequest.OBJ_ID, ucj.getId())
              ));

            ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
            if ( approval == null || approval != ApprovalStatus.REQUESTED ) {
              ucj.setStatus(ApprovalStatus.REJECTED == approval ? CapabilityJunctionStatus.ACTION_REQUIRED : CapabilityJunctionStatus.GRANTED);

              DAO userDAO = (DAO) x.get("localUserDAO");
              User user = (User) userDAO.find(ucj.getSourceId());
              Subject subject = new Subject.Builder(x).build();
              subject.setUser(user);
              if ( ucj instanceof AgentCapabilityJunction ) {
                User effectiveUser = (User) userDAO.find(((AgentCapabilityJunction) ucj).getEffectiveUser());
                subject.setUser(effectiveUser);
              }
              X ownerContext = x.put("subject", subject);

              ((DAO) x.get("userCapabilityJunctionDAO")).inX(ownerContext).put(ucj);
            }
          }
        }, "User Compliance Approval");
      `
    }
  ]
});
