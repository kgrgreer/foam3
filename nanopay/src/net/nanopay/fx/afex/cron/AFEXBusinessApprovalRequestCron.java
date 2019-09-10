package net.nanopay.fx.afex.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.mlang.MLang;
import java.util.List;
import java.util.Calendar;
import java.util.Date;
import net.nanopay.approval.ApprovalRequest;
import net.nanopay.approval.ApprovalRequestUtil;
import net.nanopay.approval.ApprovalStatus;
import net.nanopay.fx.afex.AFEXBusinessApprovalRequest;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;



public class AFEXBusinessApprovalRequestCron implements ContextAgent {

  @Override
  public void execute(X x) {

    process(x);
  }

  public void process(X x) {
    DAO approvalRequestDAO = ((DAO) x.get("approvalRequestDAO"));
    List pendinApprovals = ((ArraySink) approvalRequestDAO
      .where(AND(
        INSTANCE_OF(AFEXBusinessApprovalRequest.class),
        EQ(AFEXBusinessApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
      ).select(new ArraySink())).getArray();

    for (Object obj : pendinApprovals) {
      AFEXBusinessApprovalRequest request = (AFEXBusinessApprovalRequest) obj;
      if ( ApprovalRequestUtil.getStatus(x, request.getObjId(), request.getClassification()) == ApprovalStatus.REQUESTED ) {
        boolean bufferElapsed = false;
        int bufferMinutes = 5;
        Calendar now = Calendar.getInstance();
        Calendar eta = Calendar.getInstance();
        eta.setTime(request.getCreated());
        eta.add(Calendar.MINUTE, bufferMinutes);
        bufferElapsed = (now.after(eta));
        if ( bufferElapsed ) {
          request = (AFEXBusinessApprovalRequest) request.fclone();
          request.setStatus(ApprovalStatus.APPROVED);
          approvalRequestDAO.put(request);
        }
      } else if ( ApprovalRequestUtil.getStatus(x, request.getObjId(), request.getClassification()) == ApprovalStatus.APPROVED ) {
        approvalRequestDAO.where(AND(
          EQ(ApprovalRequest.DAO_KEY, request.getDaoKey()),
          EQ(ApprovalRequest.OBJ_ID, String.valueOf(request.getObjId())),
          EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
        .removeAll();
      }
    }
  }
}
