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
    if ( old != null && old.getStatus() != request.getStatus() ) {
      DAO requests = ApprovalRequestUtil.getAllRequests(x, request.getObjId(), request.getClassification());
      // if points are sufficient to consider object approved
      if ( getCurrentPoints(requests) >= request.getRequiredPoints() ||
      getCurrentRejectedPoints(requests) >= request.getRequiredRejectedPoints() ) {
        //removes all the requests that were not approved to clean up approvalRequestDAO
        removeUnusedRequests(requests);
        
        //puts object to its original dao
        rePutObject(x, request);
      }
    }
    return request;
  }

  private void rePutObject(X x, ApprovalRequest request) {
    DAO dao = (DAO) x.get(request.getDaoKey());
    FObject found = dao.inX(x).find(request.getObjId()).fclone();
    dao.inX(x).put(found);
  }

  private void removeUnusedRequests(DAO dao) {
    dao.where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)).removeAll();
  }

  private long getCurrentPoints(DAO dao) {
    return ((Double)
      ((Sum) dao
        .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED))
        .select(SUM(ApprovalRequest.POINTS))
      ).getValue()
    ).longValue();
  }

  private long getCurrentRejectedPoints(DAO dao) {
    return ((Double)
      ((Sum) dao
        .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED))
        .select(SUM(ApprovalRequest.POINTS))
      ).getValue()
    ).longValue();
  }
}
