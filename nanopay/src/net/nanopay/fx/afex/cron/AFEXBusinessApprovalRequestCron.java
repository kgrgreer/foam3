package net.nanopay.fx.afex.cron;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import java.util.Calendar;
import java.util.List;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestUtil;
import foam.nanos.approval.ApprovalStatus;
import net.nanopay.fx.afex.AFEXUser;
import net.nanopay.fx.afex.AFEXBusinessApprovalRequest;
import net.nanopay.fx.afex.AFEXCredentials;

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

    DAO credentialDAO = (DAO) x.get("afexCredentialDAO");
    DAO afexUserDAO = (DAO) x.get("afexUserDAO");
    for (Object obj : pendinApprovals) {
      AFEXBusinessApprovalRequest request = (AFEXBusinessApprovalRequest) obj;
      if ( ApprovalRequestUtil.getStatus(x, request.getObjId(), request.getClassification()) == ApprovalStatus.REQUESTED ) {
        AFEXUser afexUser = (AFEXUser) afexUserDAO.find(request.getObjId());
        AFEXCredentials credentials = (AFEXCredentials) credentialDAO.find(MLang.EQ(AFEXCredentials.SPID, afexUser.findUser(x).getSpid()));
        boolean bufferElapsed = false;
        Calendar now = Calendar.getInstance();
        Calendar eta = Calendar.getInstance();
        eta.setTime(request.getCreated());
        eta.add(Calendar.MINUTE, credentials.getClientApprovalDelay());
        bufferElapsed = (now.after(eta));
        if ( bufferElapsed ) {
          request = (AFEXBusinessApprovalRequest) request.fclone();
          request.setStatus(ApprovalStatus.APPROVED);
          approvalRequestDAO.put(request);
        }
      } else if ( ApprovalRequestUtil.getStatus(x, request.getObjId(), request.getClassification()) == ApprovalStatus.APPROVED ) {
        approvalRequestDAO.where(AND(
          EQ(ApprovalRequest.DAO_KEY, request.getDaoKey()),
          EQ(ApprovalRequest.OBJ_ID, request.getObjId()),
          EQ(ApprovalRequest.CLASSIFICATION, request.getClassification()),
          EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
        .removeAll();
      }
    }
  }
}
