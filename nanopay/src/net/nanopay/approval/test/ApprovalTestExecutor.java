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
import foam.nanos.logger.Logger;
import foam.nanos.ruler.Operations;
import foam.nanos.test.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import net.nanopay.liquidity.crunch.CapabilityRequest;
import net.nanopay.liquidity.crunch.CapabilityRequestOperations;

import static foam.mlang.MLang.*;

public class ApprovalTestExecutor extends Test {
  private User firstSystemUser;
  private User secondSystemUser;
  private X systemX, firstX, secondX;
  private Logger logger;
  private String prefix;
  private ApprovalTestExecutorState[] states;

  public ApprovalTestExecutor(String prefix, ApprovalTestExecutorState[] testStates) {
    this.prefix = prefix;
    this.states = testStates;
  }

  // Prefix used to differentiate this test from all others using the same base class
  protected String getTestPrefix() {
    return prefix;
  }

  public void runTest(X x) {
    // Setup contexts
    this.setupContexts(x);

    // Get the expected actions and states for this test
    test(this.states != null, "Test states must be set");

    // Add a user
    this.logger.info(prefix, "Creating user");
    User user = this.addUser(this.getFirstX());

    // Test approval request creation
    this.logger.info(prefix, "Checking approval requests");
    ApprovalRequest request = this.testApprovalRequestCreation(this.getSystemX(), user, this.getFirstSystemUser(x), this.getSecondSystemUser(x), Operations.CREATE);

    // 01 - Approve / reject
    this.logger.info(prefix, "Applying approval action", states[0].getApprovalStatus());
    this.applyApprovalAction(this.getSecondX(), states[0].getApprovalStatus(), request, user, Operations.CREATE);

    // Check status
    this.logger.info(prefix, "Checking lifecycle state", states[0].getLifecycleState());
    user = this.checkUserStatus(this.getSystemX(), states[0].getLifecycleState(), user);

    // Stop the test if the user was rejected
    if (states[0].getApprovalStatus() == ApprovalStatus.REJECTED) {
      this.logger.info(prefix, "Stopping test after creation rejection");
      return;
    }

    // Update the user
    this.logger.info(prefix, "Updating the user");
    this.updateUser(this.getFirstX(), user);

    // Test approval request creation
    this.logger.info(prefix, "Checking approval requests");
    request = this.testApprovalRequestCreation(this.getSystemX(), user, this.getFirstSystemUser(x), this.getSecondSystemUser(x), Operations.UPDATE);

    // Test approvable created
    this.logger.info(prefix, "Checking requested approvables");
    this.testApprovableCreation(this.getSystemX(), user, ApprovalStatus.REQUESTED, false);

    // 02 - Approve / reject
    this.logger.info(prefix, "Applying approval action", states[1].getApprovalStatus());
    this.applyApprovalAction(this.getSecondX(), states[1].getApprovalStatus(), request, user, Operations.UPDATE);

    // Validation
    this.logger.info(prefix, "Validating requested approvables");
    this.testApprovableCreation(this.getSystemX(), user, states[1].getApprovalStatus(), states[1].getApprovalStatus() == ApprovalStatus.APPROVED);

    // Check status
    this.logger.info(prefix, "Checking lifecycle state", states[1].getLifecycleState());
    user = this.checkUserStatus(this.getSystemX(), states[1].getLifecycleState(), user);

    // Remove the user
    this.logger.info(prefix, "Removing the user");
    this.removeUser(this.getFirstX(), user);

    // Test approval request creation
    this.logger.info(prefix, "Checking approval requests");
    request = this.testApprovalRequestCreation(this.getSystemX(), user, this.getFirstSystemUser(x), this.getSecondSystemUser(x), Operations.REMOVE);

    // 03 - Approve / reject
    this.logger.info(prefix, "Applying approval action", states[2].getApprovalStatus());
    this.applyApprovalAction(this.getSecondX(), states[2].getApprovalStatus(), request, user, Operations.REMOVE);

    // Check status
    this.logger.info(prefix, "Checking lifecycle state", states[2].getLifecycleState());
    user = this.checkUserStatus(this.getSystemX(), states[2].getLifecycleState(), user);
  }

  protected void setupContexts(X x) {
    this.systemX = x.put("user", new User.Builder(x).setId(1).build());
    this.firstX = x.put("user", this.getFirstSystemUser(x));
    this.secondX = x.put("user", this.getSecondSystemUser(x));
    this.logger = (Logger) x.get("logger");
  }

  protected X getSystemX() {
    if (this.systemX == null) {
      throw new RuntimeException("SystemX: setupContexts has not been called.");
    }
    return this.systemX;
  }

  protected X getFirstX() {
    if (this.firstX == null) {
      throw new RuntimeException("FirstX: setupContexts has not been called.");
    }
    return this.firstX;
  }

  protected X getSecondX() {
    if (this.secondX == null) {
      throw new RuntimeException("SecondX: setupContexts has not been called.");
    }
    return this.secondX;
  }

  protected DAO getApprovableDAO(X x) {
    return (DAO) x.get("approvableDAO");
  }

  protected DAO getApprovalRequestDAO(X x) {
    return (DAO) x.get("approvalRequestDAO");
  }

  protected DAO getLocalUserDAO(X x) {
    return (DAO) x.get("localUserDAO");
  }

  protected DAO getCapabilityRequestDAO(X x) {
    return (DAO) x.get("capabilityRequestDAO");
  }

  protected UserQueryService getUserQueryService(X x) {
    return (UserQueryService) x.get("userQueryService");
  }  

  protected String getFirstSystemUserEmail() {
    return getTestPrefix() + "approvaltest01@nanopay.net";
  }

  protected User getFirstSystemUser(X x) {
    if (this.firstSystemUser == null) {
      this.firstSystemUser = this.setupSystemUser(x, this.getFirstSystemUserEmail());
    }
    return this.firstSystemUser;
  }

  protected String getSecondSystemUserEmail() {
    return getTestPrefix() + "approvaltest02@nanopay.net";
  }

  protected User getSecondSystemUser(X x) {
    if (this.secondSystemUser == null) {
      this.secondSystemUser = this.setupSystemUser(x, this.getSecondSystemUserEmail());
    }
    return this.secondSystemUser;
  }

  protected User setupSystemUser(X x, String email) {
    // Find the user and return if they exist
    User user = (User) getLocalUserDAO(x).inX(this.getSystemX()).find(EQ(User.EMAIL, email));
    if (user != null && user.getLifecycleState() == LifecycleState.ACTIVE) {
      return user;
    }
    
    // Otherwise, create the user
    user = new User.Builder(x)
        .setFirstName(this.getTestPrefix() + "Approval")
        .setLastName("System")
        .setEmail(email)
        .setGroup("liquidBasic")
        .setJobTitle("Approver")
        .setOrganization("Goldman Sachs")
        .setLifecycleState(LifecycleState.ACTIVE)
        .setEnabled(true)
        .build();
    user = (User) ((DAO) this.getLocalUserDAO(x).inX(this.getSystemX())).put(user);

    List<Long> userList = new ArrayList<Long>();
    userList.add(user.getId());

    // Assign role
    CapabilityRequest capabilityRequest = new CapabilityRequest.Builder(this.getSystemX())
      .setGlobalCapability("8b36b11a-93c6-b40c-d9c8-f8effefb31cc-8")
      .setRequestType(CapabilityRequestOperations.ASSIGN_GLOBAL)
      .setUsers(userList)
      .setLifecycleState(LifecycleState.ACTIVE)
      .build();
    this.getCapabilityRequestDAO(x).inX(this.getSystemX()).put(capabilityRequest);
    
    return user;
  }

  private User addUser(X x) {
    // Email of the user for the test
    String email = this.getTestPrefix() + "approvaltestuser@nanopay.net";

    // Check if the user already exists
    User user = (User) getLocalUserDAO(x).inX(getSystemX()).find(EQ(User.EMAIL, email));
    test(user == null, "User already exists: " + email);

    // Create a new user
    user = new User.Builder(x)
      .setFirstName(this.getTestPrefix())
      .setLastName("Test")
      .setEmail(email)
      .setGroup("liquidBasic")
      .setJobTitle("Tester")
      .setOrganization("Goldman Sachs")
      .setEnabled(true)
      .build();

    // Add to the context
    user = (User) getLocalUserDAO(x).inX(x).put(user);
    test(user != null, "User not created: " + this.getTestPrefix());
    test(user.getLifecycleState().equals(LifecycleState.PENDING), "Created User LifecycleState is PENDING: " + this.getTestPrefix());
    return user;
  }

  private void updateUser(X x, User user) {
    // Clone the user
    user = (User) user.fclone();

    String oldLastName = user.getLastName();

    // Change a field
    test(!oldLastName.equals(this.getTestPrefix()), "Last name already updated: " + this.getTestPrefix());
    user.setLastName(this.getTestPrefix());

    // Put the user
    getLocalUserDAO(x).inX(x).put(user);

    // Test that the user has not been updated
    User foundUser = (User) getLocalUserDAO(x).inX(x).find(user.getId());
    test(foundUser != null, "User not found after unapproved update");
    test(foundUser.getLastName().equals(oldLastName), "Last name updated before being approved: " + foundUser.getLastName());
  }

  private void removeUser(X x, User user) {
    // call remove on the user
    try {
      getLocalUserDAO(x).inX(x).remove(user);
    } 
    catch (RuntimeException ex) 
    { 
      test(ex.getMessage().equals("An approval request has been sent out."), "Expecting approval exception: " + ex.getMessage());
    }

    // make sure the user still exists
    User foundUser = (User) getLocalUserDAO(x).inX(x).find(user.getId());
    test(foundUser != null, "User not found after unapproved delete");
  }

  private ApprovalRequest testApprovalRequestCreation(X x, User user, User requestingUser, User approvingUser, Operations operation) {
    // Request to return
    ApprovalRequest approvalRequest = null;
    ArraySink approvalRequests = null;

    // Retrieve approval requests
    if (operation != Operations.UPDATE) {
      DAO requests = ApprovalRequestUtil.getAllRequests(x, String.valueOf(user.getId()), "User");
      approvalRequests = (ArraySink) requests.select(new ArraySink());
    } else {
      // Update keys are different than create keys
      approvalRequests = (ArraySink) getApprovalRequestDAO(x).inX(x).where(AND(
        CONTAINS_IC(ApprovalRequest.OBJ_ID, "dbareUserDAO:o" + String.valueOf(user.getId())),
        EQ(ApprovalRequest.CLASSIFICATION, "User"),
        EQ(ApprovalRequest.OPERATION, Operations.UPDATE)
      )).select(new ArraySink());
    }

    // Make sure they are all set to REQUESTED
    List<Long> requestApproverIds = new ArrayList<>();
    for ( int j = 0; j < approvalRequests.getArray().size(); j++ ) {

      // Is it set to requested
      ApprovalRequest request = (ApprovalRequest) approvalRequests.getArray().get(j);

      // Skip fulfilled requests
      if (request.getIsFulfilled())
        continue;

      // Make sure any other requests are REQUESTED
      test(request.getStatus() == ApprovalStatus.REQUESTED, "ApprovalRequest set to " + request.getStatus() + ": " + request.getId());

      // Look for the approving user 
      if (request.getApprover() == approvingUser.getId())
        approvalRequest = request;

      // Keep track off all the approvers
      requestApproverIds.add(request.getApprover());
    }
    
    // Remove the requestor from the set of approvers
    //requestApproverIds.remove(requestingUser.getId());
    Collections.sort(requestApproverIds);

    // Lookup all of the possible approvers
    List<Long> approverIds = this.getUserQueryService(x).getAllApprovers(x, User.getOwnClassInfo().getObjClass().getSimpleName());
    Collections.sort(approverIds);
    
    // Test to see if they match
    test(approverIds.equals(requestApproverIds), "UCJ approvers and approval requests match");
    
    // Test that an approval request has been found for the approving user
    test(approvalRequest != null, "No approval request found for approving user");
    return approvalRequest;
  }

  private void testApprovableCreation(X x, User user, ApprovalStatus expectedStatus, Boolean updateApplied) {
    // Find the approvable
    Approvable foundApprovable = (Approvable) this.getApprovableDAO(x).inX(x).find(
      AND(
        EQ(Approvable.DAO_KEY, "bareUserDAO"),
        EQ(Approvable.OBJ_ID, String.valueOf(user.getId()))
      )
    );
    test(foundApprovable != null, "Approvable found after update");
    test(foundApprovable.getStatus() == expectedStatus, "Expected status: " + expectedStatus + ". Actual status: " + foundApprovable.getStatus());
    
    // Test that the user has not been updated
    User foundUser = (User) getLocalUserDAO(x).inX(x).find(user.getId());
    test(foundUser != null, "User found for update applied check");

    // Check if the update should have been applied
    if (updateApplied)
      test(updateApplied ? 
          foundUser.getLastName().equals(this.getTestPrefix()) : 
        ! foundUser.getLastName().equals(this.getTestPrefix()), "Update should be applied: " + updateApplied);
  }

  private void applyApprovalAction(X x, ApprovalStatus status, ApprovalRequest request, User user, Operations operation) {
    test(request != null, "No ApprovalRequest found for approving user: " + this.getTestPrefix());
    
    // Mark the request with the appropriate status
    request = (ApprovalRequest) request.fclone();
    request.setStatus(status);

    // Save the approval
    this.getApprovalRequestDAO(x).inX(x).put(request);

    // Check the approval
    ApprovalRequest foundRequest = (ApprovalRequest) this.getApprovalRequestDAO(x).inX(this.getSystemX()).find(request.getId());
    test(foundRequest.getStatus() == status, "ApprovalRequest status not updated to: " + status + " - " + this.getTestPrefix());

    ArraySink approvalRequests = (ArraySink) this.getApprovalRequestDAO(x).inX(this.getSystemX()).where(AND(
      CONTAINS_IC(ApprovalRequest.OBJ_ID, String.valueOf(user.getId())),
      EQ(ApprovalRequest.CLASSIFICATION, "User"),
      EQ(ApprovalRequest.OPERATION, operation)
    )).select(new ArraySink());
    test(approvalRequests.getArray().size() == 1, "More than 1 executed approval requests found: " + approvalRequests.getArray().size());

    ApprovalRequest approvedRequest = (ApprovalRequest) approvalRequests.getArray().get(0);
    test(approvedRequest.getStatus() == status, "Found approval request must be: " + status);
  }

  private User checkUserStatus(X x, LifecycleState lifecycleState, User user) {
    User foundUser = (User) getLocalUserDAO(x).inX(x).find(user.getId());
    test(foundUser != null, "Cannot find user to check lifecycle state: " + lifecycleState + " - " + this.getTestPrefix());

    // Check the lifecycle state
    test(foundUser.getLifecycleState() == lifecycleState, "Found user lifecycle state incorrect. Expected: " + lifecycleState + ". Actual: " + foundUser.getLifecycleState());
    return foundUser;
  }  
}
