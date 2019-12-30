foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountApprovableAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Map',
    'java.util.List',
    'foam.mlang.MLang',
    'foam.mlang.MLang.*',
    'foam.core.FObject',
    'foam.dao.ArraySink',
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
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.approvalRequest.Approvable',
    'net.nanopay.liquidity.approvalRequest.ApprovableAware',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest',
    'net.nanopay.liquidity.approvalRequest.AccountRoleApprovalRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    {
      name: 'sendSingleAccountRequest',
      type: 'void',
      args: [
        { name: 'x', type: 'X' },
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
        { name: 'x', type: 'X' },
        { name: 'request', type: 'RoleApprovalRequest' },
        { name: 'obj', type: 'FObject' }
      ],
      javaCode:`

      // TODO: Basically in AccountApprovableAwareDAO cast RoleApprovalRequest
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
        throw new RuntimeException("Using an invalid operation!");
      }

      /**
        TODO: REIMPLEMENT WITH CRUNCH
        DAO requestingDAO;

        if ( liquidRequest.getDaoKey().equals("approvableDAO") ){
          DAO approvableDAO = (DAO) x.get("approvableDAO");

          Approvable approvable = (Approvable) approvableDAO.find(liquidRequest.getObjId());

          requestingDAO = (DAO) x.get(approvable.getDaoKey());
        } else {
          requestingDAO = (DAO) x.get(liquidRequest.getDaoKey());
        }

        DAO accountDAO = (DAO) x.get("accountDAO");

        String modelName = requestingDAO.getOf().getObjClass().getSimpleName();
        Account outgoingAccount = (Account) accountDAO.find(outgoingAccountId);

        Boolean isGlobalRole = true;
        List<Role> baseRoles;
        Role baseRole;
        DAO approverDAO;

        // TODO: REDO DAOS after configuring services and connecting with CRUNCH
        switch(modelName){
          case "Account":
            approverDAO = outgoingAccount.getAccountApprovers(getX()).getDAO();
            isGlobalRole = false;
            break;
          case "RoleAssignmentTemplate": // TODO: Reconfirm with RUBY
            approverDAO = outgoingAccount.getRoleAssignmentApprovers(getX()).getDAO();
            isGlobalRole = false;
            break;
          case "Transaction":
            approverDAO = outgoingAccount.getTransactionApprovers(getX()).getDAO();
            isGlobalRole = false;
            break;
          default:
            approverDAO = null;
        }
        
        if ( approverDAO != null ){
          // makers cannot approve their own requests even if they are an approver for the account
          // however they will receive an approvalRequest which they can only view and not approve or reject
          // so that they can keep track of the status of their requests
          sendSingleAccountRequest(x, accountRequest, request.getInitiatingUser());

          // TODO: 
          approverDAO.where(MLang.NEQ( UserCapabilityJunction.SOURCE_ID, request.getInitiatingUser() )).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              sendSingleAccountRequest(x, accountRequest, ((UserCapabilityJunction) obj).getSourceId());
            }
          });
        }
       */
      `
    }
  ]
});
