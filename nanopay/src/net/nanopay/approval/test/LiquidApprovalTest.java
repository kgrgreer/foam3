package net.nanopay.approval.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.approval.Approvable;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestUtil;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.User;
import foam.nanos.auth.UserQueryService;
import foam.nanos.ruler.Operations;
import foam.nanos.test.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static foam.mlang.MLang.*;

public class LiquidApprovalTest extends Test {
  private DAO approvalRequestDAO, approvableDAO, userDAO;
  private User systemUser;
  private UserQueryService userQueryService;


  public void runTest(X x) {
    approvableDAO = (DAO) x.get("approvableDAO");
    approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
    userDAO = (DAO) x.get("localUserDAO");
    userQueryService = (UserQueryService) x.get("userQueryService");

    approvalTest(x);
    rejectionTest(x);
  }

  public void approvalTest(X x) {
    systemUser = (User) userDAO.find(EQ(User.EMAIL, "liquidsystemtest@nanopay.net"));
    if ( systemUser == null ) {
      systemUser = new User.Builder(x)
        .setId(10000)
        .setFirstName("Liquid-System")
        .setLastName("Test")
        .setEmail("liquidsystemtest@nanopay.net")
        .setGroup("liquidBasic")
        .setJobTitle("Approver")
        .setOrganization("Goldman Sachs")
        .setEnabled(true)
        .build();
      userDAO.put(systemUser);
    }

    x = x.put("user", systemUser);

    User userToApprove = (User) userDAO.find(EQ(User.EMAIL, "liquidapprovaltest@nanopay.net"));
    test(userToApprove == null, "User to approve does not exist yet");

    if ( userToApprove == null ) {
      userToApprove = new User.Builder(x)
        .setId(11000)
        .setFirstName("Liquid-Approval")
        .setLastName("Test")
        .setEmail("liquidapprovaltest@nanopay.net")
        .setGroup("liquidBasic")
        .setJobTitle("CEO")
        .setOrganization("Goldman Sachs")
        .setEnabled(true)
        .build();
    }
    userToApprove = (User) userDAO.inX(x).put(userToApprove);
    test(userToApprove.getLifecycleState().equals(LifecycleState.PENDING), "User to approve LifecycleState is PENDING");

    DAO requests = ApprovalRequestUtil.getAllRequests(x, String.valueOf(userToApprove.getId()), "User");
    ArraySink approvalRequests = (ArraySink) requests.select(new ArraySink());

    String message1 = "Approval requests for user to approve were created for all users in the role";
    String message2 = "Approval requests for user to approve are all in the requested status";
    checkApprovalRequests(x, systemUser, userToApprove, approvalRequests, message1, message2);

    ApprovalRequest requestToApprove = (ApprovalRequest) approvalRequests.getArray().get(0);
    systemUser = (User) userDAO.find(requestToApprove.getApprover());
    x = x.put("user", systemUser);
    requestToApprove.setStatus(ApprovalStatus.APPROVED);
    approvalRequestDAO.inX(x).put(requestToApprove);

    String message3 = "Approval request for approved user successfully marked as approved";
    String message4 = "All other approval requests for approved user successfully removed";
    checkRequestStatus(x, requestToApprove, ApprovalStatus.APPROVED, userToApprove, message3, message4);

    systemUser = (User) userDAO.find(EQ(User.EMAIL, "liquidsystemtest@nanopay.net"));
    x = x.put("user", systemUser);
    userToApprove = (User) userDAO.find(userToApprove.getId());
    test(userToApprove.getLifecycleState().equals(LifecycleState.ACTIVE), "Approved user LifecycleState is ACTIVE after approving approval request");

    String nameUpdate = "Liquid-Approval-Update";
    String message5 = "Approvable object created for User to approve after user update";
    String message6 = "Approvable object status for User to approve updated to APPROVED after request was approved";
    String message7 = "User to approve firstName successfully updated after approvable request was approved";
    fetchApprovable(x, userToApprove, nameUpdate, message5, message6, message7);

    String message8 = "Approval request created to remove approved user";
    String message9 = "Approved user removed, LifecycleState updated to DELETED";
    removeUser(x, userToApprove, message8, message9);
  }

  public void rejectionTest(X x) {
    systemUser = (User) userDAO.find(EQ(User.EMAIL, "liquidsystemtest@nanopay.net"));
    x = x.put("user", systemUser);

    User userToReject = (User) userDAO.find(EQ(User.EMAIL, "liquidrejectiontest@nanopay.net"));
    test(userToReject == null, "User to reject does not exist yet");

    if ( userToReject == null ) {
      userToReject = new User.Builder(x)
        .setId(12000)
        .setFirstName("Liquid-Rejection")
        .setLastName("Test")
        .setEmail("liquidrejectiontest@nanopay.net")
        .setGroup("liquidBasic")
        .setJobTitle("CEO")
        .setOrganization("Goldman Sachs")
        .setEnabled(true)
        .build();
    }
    userToReject = (User) userDAO.inX(x).put(userToReject);
    test(userToReject.getLifecycleState().equals(LifecycleState.PENDING), "User to reject LifecycleState is PENDING");

    DAO requests = ApprovalRequestUtil.getAllRequests(x, String.valueOf(userToReject.getId()), "User");
    ArraySink approvalRequests = (ArraySink) requests.select(new ArraySink());

    String message1 = "Approval requests for user to reject were created for all users in the role";
    String message2 = "Approval requests for user to reject are all in the requested status";
    checkApprovalRequests(x, systemUser, userToReject, approvalRequests, message1, message2);

    ApprovalRequest requestToReject = (ApprovalRequest) approvalRequests.getArray().get(0);
    systemUser = (User) userDAO.find(requestToReject.getApprover());
    x = x.put("user", systemUser);
    requestToReject.setStatus(ApprovalStatus.REJECTED);
    approvalRequestDAO.inX(x).put(requestToReject);

    String message3 = "Approval request for rejected user successfully marked as rejected";
    String message4 = "All other approval requests for rejected user successfully removed";
    checkRequestStatus(x, requestToReject, ApprovalStatus.REJECTED, userToReject, message3, message4);

    systemUser = (User) userDAO.find(EQ(User.EMAIL, "liquidsystemtest@nanopay.net"));
    x = x.put("user", systemUser);
    userToReject = (User) userDAO.find(userToReject.getId());
    test(userToReject.getLifecycleState().equals(LifecycleState.REJECTED), "Rejected user LifecycleState is REJECTED after rejecting approval request");

    String nameUpdate = "Liquid-Rejection-Update";
    String message5 = "Approvable object created for User to reject after user update";
    String message6 = "Approvable object status for User to reject updated to APPROVED after request was approved";
    String message7 = "User to reject firstName successfully updated after approvable request was approved";
    fetchApprovable(x, userToReject, nameUpdate, message5, message6, message7);

    String message8 = "Approval request created to remove rejected user";
    String message9 = "Rejected user removed, LifecycleState updated to DELETED";
    removeUser(x, userToReject, message8, message9);
  }

  private void checkApprovalRequests(X x, User systemUser, User user, ArraySink approvalRequests, String message1, String message2) {
    String modelName = User.getOwnClassInfo().getObjClass().getSimpleName();
    List<Long> approverIds = userQueryService.getAllApprovers(x, modelName, user);
    List<Long> requestApproverIds = new ArrayList<>();
    boolean requestsMarkedRequested = true;
    for ( int j = 0; j < approvalRequests.getArray().size(); j++ ) {
      ApprovalRequest request = (ApprovalRequest) approvalRequests.getArray().get(j);
      requestApproverIds.add(request.getApprover());
      if ( ! request.getStatus().equals(ApprovalStatus.REQUESTED)) {
        requestsMarkedRequested = false;
      }
    }
    requestApproverIds.remove(systemUser.getId());

    Collections.sort(approverIds);
    Collections.sort(requestApproverIds);
    test(approverIds.equals(requestApproverIds), message1);
    test(requestsMarkedRequested, message2);
  }

  private void checkRequestStatus(X x, ApprovalRequest requestToMark, ApprovalStatus statusToCheck, User userToCheck, String message1, String message2) {
    ApprovalRequest markedRequest = (ApprovalRequest) approvalRequestDAO.find(requestToMark.getId());
    test(markedRequest.getStatus().equals(statusToCheck), message1);

    DAO requests = ApprovalRequestUtil.getAllRequests(x, String.valueOf(userToCheck.getId()), "User");
    ArraySink approvalRequests = (ArraySink) requests.select(new ArraySink());
    ApprovalRequest approvedRequest = (ApprovalRequest) approvalRequests.getArray().get(0);
    test(approvalRequests.getArray().size() == 1 && approvedRequest.getStatus().equals(statusToCheck), message2);
  }

  private void fetchApprovable(X x, User user, String nameUpdate, String message1, String message2, String message3) {
    user = (User) user.fclone();
    user.setFirstName(nameUpdate);
    user = (User) userDAO.inX(x).put(user);

    ArraySink approvableSink = (ArraySink) approvableDAO.where(
      AND(
        EQ(Approvable.DAO_KEY, "bareUserDAO"),
        EQ(Approvable.OBJ_ID, String.valueOf(user.getId()))
      )
    ).select(new ArraySink());

    Approvable approvable = (Approvable) approvableSink.getArray().get(0);
    test(approvable != null, message1);

    ArraySink approvalRequestSink = (ArraySink) approvalRequestDAO.where(
      AND(
        EQ(ApprovalRequest.DAO_KEY, "approvableDAO"),
        EQ(ApprovalRequest.OBJ_ID, String.valueOf(approvable.getId()))
      )
    ).select(new ArraySink());

    ApprovalRequest request = (ApprovalRequest) approvalRequestSink.getArray().get(0);
    User approver = (User) userDAO.find(request.getApprover());
    x = x.put("user", approver);
    request.setStatus(ApprovalStatus.APPROVED);
    approvalRequestDAO.inX(x).put(request);

    approvable = (Approvable) approvableDAO.find(approvable.getId());
    test(approvable.getStatus().equals(ApprovalStatus.APPROVED), message2);

    user = (User) userDAO.find(user.getId());
    test(user.getFirstName().equals(nameUpdate), message3);
  }

  private void removeUser(X x, User user, String message1, String message2) {
    try {
      userDAO.inX(x).remove(user);
    } catch (RuntimeException ignored){}

    DAO requests = ApprovalRequestUtil.getAllRequests(x, String.valueOf(user.getId()), "User");
    ArraySink sink = (ArraySink) requests.where(EQ(ApprovalRequest.OPERATION, Operations.REMOVE)).select(new ArraySink());

    ApprovalRequest request = (ApprovalRequest) sink.getArray().get(0);
    test(request != null, message1);

    systemUser = (User) userDAO.find(request.getApprover());
    x = x.put("user", systemUser);
    request.setStatus(ApprovalStatus.APPROVED);
    approvalRequestDAO.inX(x).put(request);

    user = (User) userDAO.inX(x).find(user.getId());
    test(user.getLifecycleState().equals(LifecycleState.DELETED), message2);
  }
}
