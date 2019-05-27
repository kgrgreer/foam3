package net.nanopay.approval;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Sum;

import static foam.mlang.MLang.*;

/**
 * When a single request is approved, checks all other approved requests and calculates points.
 * If points are sufficient ( >= requiredPoints ), removes all unused requests from approvalRequestDAO and
 * Re-submits the object to its dao (daoKey), where a rule should be defined to determine further actions.
 */
public class ApprovalDAO
  extends ProxyDAO {

  public ApprovalDAO(X x,DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO requestDAO = ((DAO)x.get("approvalRequestDAO"));
    ApprovalRequest old = (ApprovalRequest) requestDAO.find(obj);
    ApprovalRequest request = (ApprovalRequest) getDelegate().put(obj);
    if ( old != null && old.getStatus() != request.getStatus() && request.getStatus() == ApprovalStatus.APPROVED ) {

      DAO requests = ApprovalRequestUtil.getAllRequests(x, request.getObjId(), request.getRequestReference());

      // if points are sufficient to consider object approved
      if ( getCurrentPoints(requests) >= request.getRequiredPoints() ) {

        //puts object to its original dao
        rePutObject(request);

        //removes all the requests that were not approved to clean up approvalRequestDAO
        removeUnsedRequests(requests);
      }
    }
    return request;
  }

  private void rePutObject(ApprovalRequest request) {
    DAO dao = (DAO) x_.get(request.getDaoKey());
    FObject found = dao.inX(x_).find(request.getObjId()).fclone();
    dao.inX(x_).put(found);
  }

  private void removeUnsedRequests(DAO dao) {
    dao.where(NEQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED)).removeAll();
  }

  private long getCurrentPoints(DAO dao) {
    return ((Double) ((Sum) dao.where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED))
      .select(SUM(ApprovalRequest.POINTS))).getValue()).longValue();
  }
}
