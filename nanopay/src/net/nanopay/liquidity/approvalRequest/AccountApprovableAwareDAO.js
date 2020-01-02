foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountApprovableAwareDAO',
  extends: 'net.nanopay.liquidity.approvalRequest.ApprovableAwareDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Map',
    'java.util.List',
    'java.util.Set',
    'foam.mlang.MLang',
    'foam.mlang.MLang.*',
    'foam.core.FObject',
    'java.util.HashSet',
    'foam.dao.ArraySink',
    'java.util.ArrayList',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.User',
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.nanos.logger.Logger',
    'foam.lib.PropertyPredicate',
    'net.nanopay.account.Account',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.LifecycleAware',
    'foam.mlang.predicate.Predicate',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService',
    'net.nanopay.liquidity.approvalRequest.Approvable',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'net.nanopay.liquidity.ucjQuery.CachedAccountUCJQueryService',
    'net.nanopay.liquidity.approvalRequest.ApprovableAware',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest'
  ],

  methods: [
    {
      name: 'sendSingleAccountRequest',
      type: 'void',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'req', type: 'AccountRoleApprovalRequest' },
        { name: 'userId', type: 'long' }
      ],
      javaCode: `
        AccountRoleApprovalRequest request = (AccountRoleApprovalRequest) req.fclone();
        request.clearId();
        request.setApprover(userId);
        ((DAO) x.get("approvalRequestDAO")).put_(x, request);
      `
    },
    {
      name: 'fullSend',
      type: 'void',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'RoleApprovalRequest' },
        { name: 'obj', type: 'FObject' }
      ],
      javaCode:`
      Logger logger = (Logger) x.get("logger");

      // AccountRoleApprovalRequest and set the outgoing account
      AccountRoleApprovalRequest accountRequest = (AccountRoleApprovalRequest) request.fclone();
      AccountApprovableAware accountApprovableAwareObj = (AccountApprovableAware) obj;
  
      if ( request.getOperation() == Operations.CREATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountCreate(x));
      } else if ( request.getOperation() == Operations.UPDATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountUpdate(x));
      } else if ( request.getOperation() == Operations.REMOVE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountDelete(x));
      } else {
        logger.error("Using an invalid operation!");
        throw new RuntimeException("Using an invalid operation!");
      }
  
      DAO requestingDAO;
      DAO capabilitiesDAO = (DAO) x.get("liquidCapabilityDAO");
  
      if ( request.getDaoKey().equals("approvableDAO") ){
        DAO approvableDAO = (DAO) x.get("approvableDAO");
  
        Approvable approvable = (Approvable) approvableDAO.find(request.getObjId());
  
        requestingDAO = (DAO) x.get(approvable.getDaoKey());
      } else {
        requestingDAO = (DAO) x.get(request.getDaoKey());
      }
  
      String modelName = requestingDAO.getOf().getObjClass().getSimpleName();
  
      CachedAccountUCJQueryService ucjQueryService = new CachedAccountUCJQueryService();
  
      List<Long> approverIds = ucjQueryService.getApproversByLevel(modelName, accountRequest.getOutgoingAccount(),1);
  
      if ( approverIds.size() <= 0 ) {
        logger.log("No Approvers exist for the model: " + modelName);
        throw new RuntimeException("No Approvers exist for the model: " + modelName);
      }
  
      // makers cannot approve their own requests even if they are an approver for the account
      // however they will receive an approvalRequest which they can only view and not approve or reject
      // so that they can keep track of the status of their requests
      sendSingleRequest(x, request, request.getInitiatingUser());
      approverIds.remove(request.getInitiatingUser());
  
      for ( int i = 0; i < approverIds.size(); i++ ){
        sendSingleRequest(getX(), request, approverIds.get(i));
      }
      `
    }
  ]
});
