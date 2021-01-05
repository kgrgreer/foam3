package net.nanopay.meter.compliance.identityMind;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.nanos.http.HttpParameters;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import java.io.IOException;
import java.util.List;

import foam.nanos.approval.ApprovalStatus;
import net.nanopay.meter.compliance.ComplianceApprovalRequest;
import net.nanopay.meter.compliance.ComplianceValidationStatus;

import static foam.mlang.MLang.*;

public class IdentityMindWebAgent implements WebAgent {

  public void execute(X x) {
    DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    DAO identityMindResponseDAO = (DAO) x.get("identityMindResponseDAO");
    DAO notificationDAO = (DAO) x.get("localNotificationDAO");
    Logger logger = (Logger) x.get("logger");
    HttpParameters p = x.get(HttpParameters.class);
    String data = p.getParameter("data");
    HttpServletRequest request = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    JSONParser jsonParser = new JSONParser();
    jsonParser.setX(x);

    try {
      IdentityMindResponse webhookResponse = (IdentityMindResponse)
        jsonParser.parseString(data, IdentityMindResponse.class);

      ArraySink sink = (ArraySink) identityMindResponseDAO.where(
        EQ(IdentityMindResponse.TID, webhookResponse.getTid())
      ).orderBy(DESC(IdentityMindResponse.CREATED)).select(new ArraySink());

      List<IdentityMindResponse> list = sink.getArray();

      if ( list.size() == 0 ) {
        // Added check for TID field within TAD field if webhook
        // TID does not match any IdentityMindResponses
        JSONObject jsonObject = new JSONObject(data);
        JSONObject tad = jsonObject.getJSONObject("tad");
        String tid = tad.getString("tid");

        sink = (ArraySink) identityMindResponseDAO.where(
          EQ(IdentityMindResponse.TID, tid)
        ).orderBy(DESC(IdentityMindResponse.CREATED)).select(new ArraySink());

        list = sink.getArray();

        String decision = jsonObject.getString("decision");
        if ( decision.equals("ACCEPTED") ) {
          webhookResponse.setRes("ACCEPT");
          webhookResponse.setFrp("ACCEPT");
        }
        if ( decision.equals("REJECTED") ) {
          webhookResponse.setRes("DENY");
          webhookResponse.setFrp("DENY");
        }
        webhookResponse.setTid(tid);
      }

      for ( int i = 0; i < list.size(); i++ ) {
        IdentityMindResponse idmResponse = (IdentityMindResponse) ((IdentityMindResponse) list.get(i)).fclone();
        idmResponse.copyFrom(webhookResponse);
        identityMindResponseDAO.put(idmResponse);

        ComplianceApprovalRequest approvalRequest = (ComplianceApprovalRequest) approvalRequestDAO.find(
          AND(
            EQ(ComplianceApprovalRequest.CAUSE_ID, idmResponse.getId()),
            EQ(ComplianceApprovalRequest.CAUSE_DAO_KEY, "identityMindResponseDAO")
          )
        );

        if ( approvalRequest != null ) {
          approvalRequest = (ComplianceApprovalRequest) approvalRequest.fclone();
          ApprovalStatus status = approvalRequest.getStatus();
          if ( status == ApprovalStatus.REQUESTED ) {
            if ( idmResponse.getComplianceValidationStatus() == ComplianceValidationStatus.VALIDATED ) {
              approvalRequest.setStatus(ApprovalStatus.APPROVED);
            } else if ( idmResponse.getComplianceValidationStatus() == ComplianceValidationStatus.REJECTED ) {
              approvalRequest.setStatus(ApprovalStatus.REJECTED);
            }
            approvalRequestDAO.put(approvalRequest);
          } else {
            Notification notification = new Notification();
            notification.setBody("The approval request has already been rejected or approved.");
            notification.setNotificationType("Approval request already updated.");
            notification.setGroupId(approvalRequest.findApprover(x).getSpid() + "-fraud-ops");
            notificationDAO.put(notification);
            logger.error("Illegal transition approval request has already been rejected or approved. ",
              "Approval Request ID: ", approvalRequest.getId(), " Response Data: ", data);
          }
        }
      }
    } catch (Exception e) {
      String message = String.format("IdentityMindWebAgent failed.", request.getClass().getSimpleName());
      logger.error(message, e);
      try {
		    response.sendError(HttpServletResponse.SC_BAD_REQUEST, message);
	     } catch (IOException e1) {
        logger.error(message, e1);
	     }
    }
  }
}
