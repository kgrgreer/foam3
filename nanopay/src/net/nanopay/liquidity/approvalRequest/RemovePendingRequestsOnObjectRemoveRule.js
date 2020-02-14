foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'RemovePendingRequestsOnObjectRemoveRule',

  documentation: `
    A rule to remove all pending approval requests related to an object which has just been removed
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.core.FObject',
    'java.util.List',
    'java.util.Map',
    'java.util.Set',
    'java.util.HashSet',
    'foam.mlang.MLang',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.ruler.Operations',
    'net.nanopay.account.Account',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest',
    'net.nanopay.liquidity.approvalRequest.Approvable'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ApprovalRequest request = (ApprovalRequest) obj.fclone();

        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {

            DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
            DAO approvableDAO = (DAO) getX().get("approvableDAO");

            if ( SafetyUtil.equals(request.getDaoKey(),"localAccountDAO") ){

              // to account for both transaction and account create requests where outgoing account is the removed object
              List accountRelatedCreateApprovals = ((ArraySink) approvalRequestDAO.where(
                MLang.AND(
                  MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED),
                  MLang.EQ(AccountRoleApprovalRequest.OUTGOING_ACCOUNT, request.getObjId()),
                  MLang.EQ(RoleApprovalRequest.OPERATION, Operations.CREATE)
                )
              ).select(new ArraySink())).getArray();

              Set<String> completedDaoIdCombo = new HashSet<>();

              // basically we need to grab all the pending create requests with this outgoing account and set their objects to REJECTED
              for ( int i = 0; i < accountRelatedCreateApprovals.size(); i++ ){
                AccountRoleApprovalRequest currentApprovalRequest = (AccountRoleApprovalRequest) accountRelatedCreateApprovals.get(i);

                String currentDaoIdCombo = currentApprovalRequest.getDaoKey() + ':' + currentApprovalRequest.getObjId().toString();

                if ( ! completedDaoIdCombo.contains(currentDaoIdCombo) ){
                  DAO currentDAO = (DAO) getX().get(currentApprovalRequest.getDaoKey());

                  // 1. grab the obj and set it to rejected
                  FObject currentObj =  currentDAO.find(currentApprovalRequest.getObjId()).fclone();
                  LifecycleAware currentLifecycleAwareObj = (LifecycleAware) currentObj;

                  if ( ! SafetyUtil.equals(currentLifecycleAwareObj.getLifecycleState(), LifecycleState.REJECTED ) ){
                    currentLifecycleAwareObj.setLifecycleState(LifecycleState.REJECTED);
                    currentDAO.put(currentObj);
                  }

                  // 3. Add to set of completed DAO ID combos
                  completedDaoIdCombo.add(currentDaoIdCombo);
                }

                // 4. remove the approval request itself
                approvalRequestDAO.remove(currentApprovalRequest);
              }
            }

            approvalRequestDAO.where(
              MLang.AND(
                MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED),
                MLang.EQ(ApprovalRequest.DAO_KEY, request.getDaoKey()),
                MLang.EQ(ApprovalRequest.OBJ_ID, request.getObjId())
              )
            ).removeAll();

            // need to find the approvables to remove first
            List approvablesToRemove = ((ArraySink) approvableDAO.where(MLang.AND(
              MLang.EQ(Approvable.DAO_KEY, request.getDaoKey()),
              MLang.EQ(Approvable.OBJ_ID, request.getObjId()),
              MLang.EQ(Approvable.STATUS, ApprovalStatus.REQUESTED)
            )).select(new ArraySink())).getArray();

            for ( int i = 0; i < approvablesToRemove.size(); i++ ){
              Approvable currentApprovable = (Approvable) approvablesToRemove.get(i);

              // 1. now that we have the approvable ids, we can remove them from the approval request dao
              approvalRequestDAO.where(
                MLang.AND(
                  MLang.EQ(ApprovalRequest.OBJ_ID, currentApprovable.getId()),
                  MLang.EQ(ApprovalRequest.DAO_KEY, "approvableDAO"),
                  MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED) // probably don't need this but just to be safe
                )
              ).removeAll();

              // 2. remove the approvable itself
              approvableDAO.remove(currentApprovable);
            }
          }
        }, "Remove all related pending approval requests on object remove");
      `
    }
  ]
});
