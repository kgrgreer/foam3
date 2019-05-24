package net.nanopay.approval;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;

/*
*
* When approvalRequest.group property is set, creates a new ApprovalRequest object for each user in the group and puts it to approvalDAO.
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
    ApprovalRequest oldRequest = (ApprovalRequest) ((DAO) getX().get("approvalRequestDAO")).find(obj);

    if ( oldRequest != null || request.findApprover(getX()) != null ) {
      return super.put_(x, obj);
    }

    Group group = request.findGroup(getX());

    if ( group == null ) {
      throw new RuntimeException("Approver or approver group must be set for approval request");
    }

    group.getUsers(getX()).select(new AbstractSink() {

      @Override
      public void put(Object obj, Detachable sub) {
        sendSingleRequest(request, ((User)obj).getId());
      }

    });
    return obj;
  }

  private void sendSingleRequest(ApprovalRequest req, long userId) {
    ApprovalRequest request = (ApprovalRequest) req.fclone();
    request.clearId();
    request.setApprover(userId);
    ((DAO) getX().get("approvalRequestDAO")).put(request);
  }
}
