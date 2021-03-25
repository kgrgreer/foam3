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
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountApprovableAwareDAO',
  extends: 'foam.nanos.approval.ApprovableAwareDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.List',
    'foam.core.FObject',
    'foam.nanos.logger.Logger',
    'foam.nanos.dao.Operation',
    'foam.nanos.approval.ApprovalRequest',
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService',
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
        getApprovalRequestDAO().inX(x).put(request);
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
        .setServerDaoKey(request.getServerDaoKey())
        .setObjId(request.getObjId())
        .setClassification(request.getClassification())
        .setOperation(request.getOperation())
        .setCreatedBy(request.getCreatedBy())
        .setStatus(request.getStatus()).build();

      AccountApprovableAware accountApprovableAwareObj = (AccountApprovableAware) obj;
  
      if ( accountRequest.getOperation() == Operation.CREATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountCreate(x));
      } else if ( accountRequest.getOperation() == Operation.UPDATE ) {
        accountRequest.setOutgoingAccount(accountApprovableAwareObj.getOutgoingAccountUpdate(x));
      } else if ( accountRequest.getOperation() == Operation.REMOVE ) {
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
    },
    {
      name: 'findApprovers',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'FObject' },
        { name: 'operation', javaType: 'foam.nanos.dao.Operation' },
        { name: 'user', javaType: 'foam.nanos.auth.User' }
      ],
      javaType: 'List<Long>',
      javaCode: ` 
        Logger logger = (Logger) x.get("logger");
        DAO requestingDAO = (DAO) x.get(getDaoKey());

        String modelName = requestingDAO.getOf().getObjClass().getSimpleName();

        AccountUCJQueryService ucjQueryService = (AccountUCJQueryService) x.get("accountUcjQueryService");
        AccountApprovableAware aaaObj = (AccountApprovableAware) obj;
        String outgoingAccount = operation == Operation.CREATE ? aaaObj.getOutgoingAccountCreate(x) : 
                                operation == Operation.UPDATE ? aaaObj.getOutgoingAccountUpdate(x) : 
                                                                aaaObj.getOutgoingAccountDelete(x);

        List<Long> approverIds = ucjQueryService.getAllApprovers(x, modelName, outgoingAccount);
          
        if ( approverIds == null || approverIds.size() <= 0 ) {
          logger.log("No Approvers exist for the model: " + modelName);
          throw new RuntimeException("No Approvers exist for the model: " + modelName);
        }

        if ( ! getCanMakerApproveOwnRequest() && approverIds.size() == 1 && approverIds.get(0) == user.getId() ) {
          logger.log("The only approver of " + modelName + " is the maker of this request!");
          throw new RuntimeException("The only approver of " + modelName + " is the maker of this request!");
        }

        return approverIds;
      `
    }
  ]
});
