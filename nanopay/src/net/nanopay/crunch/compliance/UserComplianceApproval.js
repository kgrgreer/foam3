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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
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
            CapabilityJunctionStatus status = ucj.getStatus();

            ApprovalStatus approval = getApprovalState(x, ucj);

            if ( approval == null || approval != ApprovalStatus.REQUESTED ) {
              status = ApprovalStatus.REJECTED == approval ? CapabilityJunctionStatus.ACTION_REQUIRED : CapabilityJunctionStatus.APPROVED;
              ucj.setStatus(status);

              if ( approval == ApprovalStatus.REJECTED ) ucj.clearData();

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
            ruler.putResult(status);
          }
        }, "User Compliance Approval");
      `
    },
    {
      name: 'getApprovalState',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      javaType: 'foam.nanos.approval.ApprovalStatus',
      javaCode: `
        DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "userCapabilityJunctionDAO"),
            EQ(ApprovalRequest.OBJ_ID, ucj.getId()),
            EQ(ApprovalRequest.IS_FULFILLED, false)
          ));
        ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
        if ( approval != ApprovalStatus.REQUESTED ) return approval;

        DAO filteredDAO = (DAO) dao.where(NEQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED));
        approval = ApprovalRequestUtil.getState(filteredDAO);
        approval = approval == null || approval == ApprovalStatus.APPROVED ? ApprovalStatus.REQUESTED : approval;

        return approval;
      `
    }
  ]
});
