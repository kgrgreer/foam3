foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountApprovableAwareDAO',
  extends: 'foam.nanos.approval.ApprovableAwareDAO',

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
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.ApprovalRequest',
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService',
    'foam.nanos.approval.Approvable',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability',
    'foam.nanos.approval.ApprovableAware',
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
        { name: 'request', type: 'ApprovalRequest' },
        { name: 'obj', type: 'FObject' },
        { name: 'approverIds', type: 'List', javaType: 'List<Long>' }
      ],
      javaCode:`
      Logger logger = (Logger) x.get("logger");

      // AccountRoleApprovalRequest and set the outgoing account
      AccountRoleApprovalRequest accountRequest = new AccountRoleApprovalRequest.Builder(x)
        .setDaoKey(request.getDaoKey())
        .setObjId(request.getObjId())
        .setApprovableCreateKey(ApprovableAware.getApprovableCreateKey(x, obj))
        .setClassification(request.getClassification())
        .setOperation(request.getOperation())
        .setCreatedBy(request.getCreatedBy())
        .setStatus(request.getStatus()).build();

      AccountApprovableAware accountApprovableAwareObj = (AccountApprovableAware) obj;
  
      if ( accountRequest.getOperation() == Operations.CREATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountCreate(x));
      } else if ( accountRequest.getOperation() == Operations.UPDATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountUpdate(x));
      } else if ( accountRequest.getOperation() == Operations.REMOVE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountDelete(x));
      } else {
        logger.error("Using an invalid operation!");
        throw new RuntimeException("Using an invalid operation!");
      }
  
      if ( getIsTrackingRequestSent() ){
        AccountRoleApprovalRequest accountTrackingRequest = (AccountRoleApprovalRequest) accountRequest.fclone();
        accountTrackingRequest.setIsTrackingRequest(true);

        sendSingleAccountRequest(x, accountTrackingRequest, accountTrackingRequest.getCreatedBy());

        approverIds.remove(accountTrackingRequest.getCreatedBy());
      }
  
      for ( int i = 0; i < approverIds.size(); i++ ){
        sendSingleAccountRequest(x, accountRequest, approverIds.get(i));
      }
      `
    }
  ]
});
