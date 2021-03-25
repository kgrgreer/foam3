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
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'net.nanopay.admin.model.ComplianceStatus',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name:  'clearDataOnRejection',
      class: 'Boolean',
      value: true
    },
    {
      name: 'setComplianceStatusOnRejection',
      class: 'Boolean',
      value: false
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
            CapabilityJunctionStatus status = ucj.getStatus();

            ApprovalStatus approval = getApprovalState(x, ucj);

            var isRequested = approval == null || approval == ApprovalStatus.REQUESTED;

            if ( ! isRequested ) {
              Subject subject = ucj.getSubject(x);
              X ownerContext = x.put("subject", subject);

              status = ApprovalStatus.REJECTED == approval ? CapabilityJunctionStatus.ACTION_REQUIRED : CapabilityJunctionStatus.APPROVED;          
              if ( approval == ApprovalStatus.REJECTED ) {
                if ( getSetComplianceStatusOnRejection() ) {
                  User user = (User) ((DAO) x.get("localUserDAO")).find(ucj.getSourceId()).fclone();
                  user.setCompliance(ComplianceStatus.FAILED);
                  ((DAO) x.get("localUserDAO")).put(user);
                }
                return;
              }
              
              ucj.setStatus(status);

              foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");     
              logger.debug(this.getClass().getSimpleName(), "ucjdao.inx.put(ucj) - subject", ownerContext.get("subject"));
              logger.debug(this.getClass().getSimpleName(), "ucjdao.inx.put(ucj) - user", ((foam.nanos.auth.Subject) ownerContext.get("subject")).getUser());
              logger.debug(this.getClass().getSimpleName(), "ucjdao.inx.put(ucj) - realuser", ((foam.nanos.auth.Subject) ownerContext.get("subject")).getRealUser());
              logger.debug(this.getClass().getSimpleName(), "ucjdao.inx.put(ucj) - ucj", ucj);
              logger.debug(this.getClass().getSimpleName(), "ucjdao.inx.put(ucj) - data", ucj.getData());

              // Update junction
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
    },
    {
      name: 'clearData',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      javaCode: `
        Capability capability = (Capability) ucj.findTargetId(x);
        if ( capability.getOf() != null ) {
          ucj.getPayload().clearData();
          return;
        }

        CrunchService crunchService = (CrunchService) x.get("crunchService");
        DAO userCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");

        List<Capability> prereqs = (List<Capability>) crunchService.getCapabilityPath(x, ucj.getTargetId(), false);

        for ( Capability prereq : prereqs ) {
          // this is the business registration capability, onboarding seems to be dependent on this, 
          // but if this is cleared and the user is prompted to reapply - it will create new business,
          // and also this is not part of the "onboarding" data, so skip over 
          if ( prereq.getId().equals("554af38a-8225-87c8-dfdf-eeb15f71215f-76")) continue;

          UserCapabilityJunction prereqUcj = crunchService.getJunction(x, prereq.getId());
          if ( prereqUcj.getStatus() == CapabilityJunctionStatus.AVAILABLE )
            continue;
          prereqUcj.setStatus(CapabilityJunctionStatus.ACTION_REQUIRED);
          prereqUcj.getPayload().clearData();
          prereqUcj.clearGracePeriod();
          prereqUcj.clearExpiry();
          prereqUcj.resetRenewalStatus();

          userCapabilityJunctionDAO.inX(x).put(prereqUcj);
        }
      `
    }
  ]
});
