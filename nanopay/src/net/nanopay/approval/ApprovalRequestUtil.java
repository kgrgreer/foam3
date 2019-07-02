package net.nanopay.approval;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Sum;

import static foam.mlang.MLang.*;

public class ApprovalRequestUtil {

  public static DAO getAllRequests(X x, String objId, String classification) {
    return ((DAO) x.get("approvalRequestDAO")).where(AND(
      EQ(ApprovalRequest.OBJ_ID, objId),
      EQ(ApprovalRequest.CLASSIFICATION, classification)
    ));
  }

  public static DAO getAllApprovedRequests(X x, String objId, String classification) {
    return getAllRequests(x, objId, classification).where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED));
  }

  public static DAO getAllRejectedRequests(X x, String objId, String classification) {
    return getAllRequests(x, objId, classification).where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED));
  }

  public static int getApprovedPoints(X x, String objId, String classification) {
    return ((Double) ((Sum) getAllApprovedRequests(x, objId, classification).select(SUM(ApprovalRequest.POINTS))).getValue()).intValue();
  }

  public static int getRejectedPoints(X x, String objId, String classification) {
    return ((Double) ((Sum) getAllRejectedRequests(x, objId, classification).select(SUM(ApprovalRequest.POINTS))).getValue()).intValue();
  }
  public static ApprovalStatus getStatus(X x, String id, String classification) {
    ApprovalRequest request = (ApprovalRequest) ((ArraySink)getAllRequests(x, id, classification).select(new ArraySink())).getArray().get(0);
    return getApprovedPoints(x, id, classification) >= request.getRequiredPoints()
      ? ApprovalStatus.APPROVED
      : getRejectedPoints(x, id, classification) >= request.getRequiredRejectedPoints()
        ? ApprovalStatus.REJECTED
        : ApprovalStatus.REQUESTED;
  }
}
