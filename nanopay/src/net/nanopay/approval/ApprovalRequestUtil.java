package net.nanopay.approval;

import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Sum;

import static foam.mlang.MLang.*;

public class ApprovalRequestUtil {

  public static DAO getAllRequests(X x, ApprovalRequest request) {
    return ((DAO) x.get("approvalRequestDAO")).where(AND(
      EQ(ApprovalRequest.OBJ_ID, request.getObjId()),
      EQ(ApprovalRequest.REQUEST_REFERENCE, request.getRequestReference())
    ));
  }

  public static DAO getAllApprovedRequests(X x, ApprovalRequest request) {
    return getAllRequests(x, request).where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED));
  }

  public static int getApprovedPoints(X x, ApprovalRequest request) {
    return ((Double) ((Sum) getAllApprovedRequests(x, request).select(SUM(ApprovalRequest.POINTS))).getValue()).intValue();
  }
}
