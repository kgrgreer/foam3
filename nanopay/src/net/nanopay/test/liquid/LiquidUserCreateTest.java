package net.nanopay.test.liquid;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.approval.Approvable;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestUtil;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.ruler.Operations;
import foam.nanos.test.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import net.nanopay.liquidity.crunch.CapabilityRequest;
import net.nanopay.liquidity.crunch.CapabilityRequestOperations;

import static foam.mlang.MLang.*;

public class LiquidUserCreateTest extends LiquidTestExecutor {
  
  public LiquidUserCreateTest() {
    super("CreateUserTest");
  }

  public void runTest(X x) {
    // Setup contexts
    this.setup(x);

    // Email of the user for the test
    String email = this.getTestPrefix() + "createtestuser@nanopay.net";

    // Check if the user already exists
    User user = (User) getLocalUserDAO(x).inX(getSystemX()).find(EQ(User.EMAIL, email));
    test(user == null, "Checking if user already exists: " + email);

    // Create a new user
    user = new User.Builder(x)
      .setFirstName(this.getTestPrefix())
      .setLastName("Test")
      .setEmail(email)
      .setGroup("liquidBasic")
      .setJobTitle("Tester")
      .setOrganization("nanopay")
      .setEnabled(true)
      .build();

    // Add to the context
    user = (User) getUserUserDAO(x).inX(getFirstX()).put(user);
    test(user != null, "Checking if user created: " + this.getTestPrefix());
    test(user.getLifecycleState().equals(LifecycleState.PENDING), "Checking if created User LifecycleState is PENDING: " + user.getLifecycleState() + " - " + this.getTestPrefix());
    test(user.getGroup().equals("liquidBasic"), "Checking if group assigned to user is liquidBasic: " + user.getGroup());
    test(user.getEmailVerified(), "Checking if user email is automatically verified: " + user.getEmailVerified());

    // Attempt retrieving the user 
    user = (User) getUserUserDAO(x).inX(getFirstX()).find(user.getId());
    test(user != null, "Checking if PENDING users can be retrieved");

    // Retrieve the user as the system
    user = (User) getUserUserDAO(x).inX(getSystemX()).find(user.getId());
    test(user != null, "Checking if retrieved user created: " + this.getTestPrefix());
    test(user.getLifecycleState().equals(LifecycleState.PENDING), "Checking if retrieved  User LifecycleState is PENDING: " + user.getLifecycleState() + " - " + this.getTestPrefix());
    test(user.getGroup().equals("liquidBasic"), "Checking if group assigned to retrieved user is liquidBasic: " + user.getGroup());
    test(user.getEmailVerified(), "Checking if retrieved user email is automatically verified: " + user.getEmailVerified());
  }
}
