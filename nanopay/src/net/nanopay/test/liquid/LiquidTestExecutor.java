package net.nanopay.test.liquid;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.approval.Approvable;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestUtil;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.auth.UserQueryService;
import foam.nanos.logger.Logger;
import foam.nanos.dao.Operation;
import foam.nanos.test.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import net.nanopay.liquidity.crunch.RoleAssignment;
import net.nanopay.liquidity.crunch.RoleAssignmentOperations;

import static foam.mlang.MLang.*;

public abstract class LiquidTestExecutor extends Test {
  private User firstSystemUser;
  private User secondSystemUser;
  private X systemX, firstX, secondX;
  private String prefix;
  protected Logger logger;

  protected LiquidTestExecutor(String prefix) {
    this.prefix = prefix;
  }

  // Prefix used to differentiate this test from all others using the same base class
  public String getTestPrefix() {
    return prefix;
  }

  protected void setup(X x) {
    this.setupContexts(x);
    this.logger.info("Setup for test: " + this.getTestPrefix());
  }

  protected void setupContexts(X x) {
    Subject systemSubject = new Subject.Builder(x).setUser(new User.Builder(x).setId(1).build()).build();
    this.systemX = x.put("subject", systemSubject);

    Subject firstSubject = new Subject.Builder(x).setUser(this.getFirstSystemUser(x)).build();
    Subject secondSubject = new Subject.Builder(x).setUser(this.getSecondSystemUser(x)).build();
    this.firstX = x.put("subject", firstSubject);
    this.secondX = x.put("subject", secondSubject);
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

  protected DAO getUserUserDAO(X x) {
    return (DAO) x.get("userUserDAO");
  }

  protected DAO getLocalRoleAssignmentDAO(X x) {
    return (DAO) x.get("localRoleAssignmentDAO");
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
        .setFirstName(this.getTestPrefix() + "User")
        .setLastName("System")
        .setEmail(email)
        .setGroup("liquidBasic")
        .setJobTitle("Approver")
        .setOrganization("nanopay")
        .setLifecycleState(LifecycleState.ACTIVE)
        .setEnabled(true)
        .build();
    user = (User) ((DAO) this.getLocalUserDAO(x).inX(this.getSystemX())).put(user);

    List<Long> userList = new ArrayList<Long>();
    userList.add(user.getId());

    // Assign role
    // TODO: make sure they use admin role template
    RoleAssignment RoleAssignment = new RoleAssignment.Builder(this.getSystemX())
      .setRoleTemplate("ddbabe1a-dea2-d4e3-09af-70aac6201ed5")
      .setUsers(userList)
      .setAccountTemplate("554af38a-8225-87c8-dfdf-eeb15f71215f-0")
      .setLifecycleState(LifecycleState.ACTIVE)
      .build();
    this.getLocalRoleAssignmentDAO(x).inX(this.getSystemX()).put(RoleAssignment);

    return user;
  }
}
