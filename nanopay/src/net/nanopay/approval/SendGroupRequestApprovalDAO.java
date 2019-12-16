package net.nanopay.approval;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.liquidity.LiquidApprovalRequest;
import net.nanopay.account.Account;
import static foam.mlang.MLang.NEQ;

/**
 * Populates "points" property for new requests based on approver user.
 * When approvalRequest.group property is set, creates a new ApprovalRequest object for each user in the group and puts it to approvalDAO.
 * When approvalRequest.approver property is set, approvalRequest.group is ignored.
 * The original object is returned and should not be used for any operations.
 */

public class SendGroupRequestApprovalDAO
extends ProxyDAO {

  public SendGroupRequestApprovalDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    ApprovalRequest request = (ApprovalRequest) obj;
    ApprovalRequest oldRequest = (ApprovalRequest) ((DAO) x.get("approvalRequestDAO")).find(obj);

    if ( oldRequest != null ) {
      return getDelegate().put_(x, obj);
    }
    User approver = request.findApprover(getX());

    if ( approver != null ) {
      request.setPoints(findUserPoints(approver));
      return super.put_(x, request);
    }

    Group group = request.findGroup(getX());

    if ( group != null ){
      group.getUsers(getX()).select(new AbstractSink() {

        @Override
        public void put(Object obj, Detachable sub) {
          sendSingleRequest(x, request, ((User)obj).getId());
        }

      });
      return obj;
    }

    // TODO: Need to figure out how to best maintain liquid approvals and normal approvals
    LiquidApprovalRequest liquidRequest = (LiquidApprovalRequest) obj;

    Long outgoingAccountId = liquidRequest.getOutgoingAccount();

    if ( outgoingAccountId != 0 ){
      DAO requestingDAO = (DAO) x.get(liquidRequest.getDaoKey());
      String modelName = requestingDAO.getOf().getObjClass().getSimpleName();
      DAO accountDAO = (DAO) x.get("accountDAO");
      Account outgoingAccount = (Account) accountDAO.find(outgoingAccountId);

      /* DOES NOT COMPILE FOR SOME REASON DESPITE WORKING ON EVALUATE AFTER COMPILING
      String getModelApproverString = "get" + modelName + "Approvers";
      Method[] manyToManyDAO = outgoingAccount.getClass().getMethod(getModelApproverString, X.class).invoke(outgoingAccount, getX());
      */

      DAO approverDAO;

      switch(modelName){
        case "Account":
          approverDAO = outgoingAccount.getAccountApprovers(getX()).getDAO();
          break;
        case "RoleAssignment":
          approverDAO = outgoingAccount.getRoleAssignmentApprovers(getX()).getDAO();
          break;
        case "Transaction":
          approverDAO = outgoingAccount.getTransactionApprovers(getX()).getDAO();
          break;
        default:
          approverDAO = null;
      }
      
      if ( approverDAO != null ){
        // makers cannot approve their own requests even if they are an approver for the account
        // however they will receive an approvalRequest which they can only view and not approve or reject
        // so that they can keep track of the status of their requests
        sendSingleRequest(x, request, liquidRequest.getInitiatingUser());

        // so that we don't accidentally double count the maker if they are also an approver
        approverDAO.where(NEQ( User.ID, liquidRequest.getInitiatingUser() )).select(new AbstractSink() {

          @Override
          public void put(Object obj, Detachable sub) {
            sendSingleRequest(x, request, ((User)obj).getId());
          }

        });
        return obj;
      }
    }

    Logger logger = (Logger) x.get("logger");
    logger.error("Approver, approver group or relationship must be set for approval request");
    throw new RuntimeException("Approver, approver group or relationship must be set for approval request");
  }

  private void sendSingleRequest(X x, ApprovalRequest req, long userId) {
    ApprovalRequest request = (ApprovalRequest) req.fclone();
    request.clearId();
    request.setApprover(userId);
    ((DAO) x.get("approvalRequestDAO")).put_(x, request);
  }

  private int findUserPoints(User user) {
    // TODO: find user points based on spid/role/group/configurations
    return 1;
  }
}
