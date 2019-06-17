package net.nanopay.meter.compliance.identityMind;

import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.nanos.http.HttpParameters;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;

import javax.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;

import net.nanopay.approval.ApprovalStatus;
import net.nanopay.meter.compliance.ComplianceApprovalRequest;
import net.nanopay.meter.compliance.ComplianceValidationStatus;

import static foam.mlang.MLang.*;

public class IdentityMindWebAgent implements WebAgent {
  @Override
  public void execute(X x) {
    DAO identityMindResponseDAO = (DAO) x.get("identityMindResponseDAO");
    DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    HttpParameters p = x.get(HttpParameters.class);
    String data = p.getParameter("data");
    HttpServletRequest request = x.get(HttpServletRequest.class);
    JSONParser jsonParser = new JSONParser();
    jsonParser.setX(x);

    try {
    IdentityMindResponse webhookResponse = (IdentityMindResponse)
        jsonParser.parseString(data, IdentityMindResponse.class);

    System.out.println("IDMWEBHOOKBODY###: " + data);
    System.out.println("IDMWEBHOOKRESPONSE###: " + webhookResponse.toString());

    ComplianceApprovalRequest approvalRequest = (ComplianceApprovalRequest) approvalRequestDAO.find(
      EQ(ComplianceApprovalRequest.CAUSE_ID, webhookResponse.getId())
    );

    if ( approvalRequest != null ) {
      System.out.println("APPROVALREQUEST###: " + approvalRequest.toString());
      if (webhookResponse.getComplianceValidationStatus() == ComplianceValidationStatus.VALIDATED) {
        approvalRequest.setStatus(ApprovalStatus.APPROVED);
      } else if (webhookResponse.getComplianceValidationStatus() == ComplianceValidationStatus.REJECTED) {
        approvalRequest.setStatus(ApprovalStatus.REJECTED);
      }
      System.out.println("UPDATEDAPPROVALREQUEST###: " + approvalRequest.toString());
      approvalRequestDAO.put(approvalRequest);
    }

    identityMindResponseDAO.put(webhookResponse);
    } catch (Exception e) {
      String message = String.format("IdentityMindWebAgent failed.", request.getClass().getSimpleName());
      ((Logger) x.get("logger")).error(message, e);
      throw new RuntimeException(message);
    }
  }
}
