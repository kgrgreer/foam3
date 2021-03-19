package net.nanopay.test.liquid;

import foam.comics.v2.userfeedback.UserFeedbackException;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.approval.*;
import foam.nanos.auth.User;
import foam.nanos.dao.Operation;

import java.util.List;

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
    try {
      getUserUserDAO(x).inX(getFirstX()).put(user);
    }
    catch (RuntimeException ex)
    {
      boolean pass = false;

      if ( ex instanceof UserFeedbackException) {
        var ufe = (UserFeedbackException) ex;
        if ( ufe.getUserFeedback().getMessage().equals("An approval request has been sent out."))
          pass = true;
      }

      test(pass, "Expecting approval exception: " + ex.getMessage());
    }

    DAO approvableDAO = getApprovableDAO(getFirstX());

    String approvableHashKey = ApprovableAware.getApprovableHashKey(getFirstX(), user, Operation.CREATE);

    String hashedId = new StringBuilder("d")
      .append("bareUserDAO")
      .append(":o")
      .append(user.getId())
      .append(":h")
      .append(String.valueOf(approvableHashKey))
      .toString();

    List approvablesPending = ((ArraySink) approvableDAO
      .where(foam.mlang.MLang.AND(
        foam.mlang.MLang.EQ(Approvable.LOOKUP_ID, hashedId),
        foam.mlang.MLang.EQ(Approvable.STATUS, ApprovalStatus.REQUESTED)
      )).inX(getFirstX()).select(new ArraySink())).getArray();

    test(approvablesPending.size() == 1, "Checking if a single approvable exists: # of approvables - " + approvablesPending.size());

    Approvable approvable = (Approvable) approvablesPending.get(0);
    String group = (String) approvable.getPropertiesToUpdate().get("group");
    Boolean emailVerified = (Boolean) approvable.getPropertiesToUpdate().get("emailVerified");

    test(group.equals("liquidBasic"), "Checking if group assigned to user is liquidBasic: " + group);
    test(emailVerified, "Checking if user email is automatically verified: " + emailVerified);

    // Attempt retrieving the user
    user = (User) getUserUserDAO(x).inX(getFirstX()).find(user.getId());
    test(user == null, "Checking if user can be retrieved if the create approvable hasn't been approved");
  }
}
