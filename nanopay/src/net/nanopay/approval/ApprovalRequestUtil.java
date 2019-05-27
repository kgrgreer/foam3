package net.nanopay.approval;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Sum;

import static foam.mlang.MLang.*;

public class ApprovalRequestUtil {

  public static DAO getAllRequests(X x, String objId, String requestReference) {
    return ((DAO) x.get("approvalRequestDAO")).where(AND(
      EQ(ApprovalRequest.OBJ_ID, objId),
      EQ(ApprovalRequest.REQUEST_REFERENCE, requestReference)
    ));
  }

  public static DAO getAllApprovedRequests(X x, String objId, String requestReference) {
    return getAllRequests(x, objId, requestReference).where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED));
  }

  public static int getApprovedPoints(X x, String objId, String requestReference) {
    return ((Double) ((Sum) getAllApprovedRequests(x, objId, requestReference).select(SUM(ApprovalRequest.POINTS))).getValue()).intValue();
  }
}
