package net.nanopay.approval.test;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.SequenceNumberDAO;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.ruler.*;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.approval.*;

import static foam.mlang.MLang.*;

public class ApprovalDAOTest
extends Test {

  private Group group;
  private ApprovalRequest initialRequest;
  private User userToTest;
  private DAO requestDAO, userDAO, ruleDAO, groupDAO;

  public void runTest(X x) {
    x = TestUtils.mockDAO(x, "ruleDAO");
    x = TestUtils.mockDAO(x, "localUserDAO");
    userDAO = new RulerDAO(x, new MDAO(User.getOwnClassInfo()), "testUserDAO");
    x = x.put("localUserDAO", userDAO);
    x = x.put("userDAO", userDAO);

    x = TestUtils.mockDAO(x, "localGroupDAO");
    groupDAO = ((DAO) x.get("localGroupDAO"));
    x = x.put("groupDAO", groupDAO);

    requestDAO = new SendGroupRequestApprovalDAO(x, new foam.dao.ValidatingDAO(x, new SequenceNumberDAO(new AuthenticatedApprovalDAO(x, new ApprovalDAO(x, new MDAO(ApprovalRequest.getOwnClassInfo()))))));
    x = x.put("approvalRequestDAO", requestDAO);
    userDAO = ((DAO) x.get("localUserDAO"));

    ruleDAO = ((DAO) x.get("ruleDAO"));

    createGroup();
    createUsers();
    createUserRule(x);
    createGroupRequest();
    testUser(x);
  }

  private void testUser(X x) {
    long numberOfRequests = ((Count)requestDAO.select(new Count())).getValue();

    test(numberOfRequests == 0, "No approval requests at the start of the test");
    userToTest = new User();
    userToTest.setId(5006L);
    userToTest.setFirstName("Pending");
    userToTest = (User) userDAO.put(userToTest);

    numberOfRequests = ((Count)requestDAO.select(new Count())).getValue();

    test(numberOfRequests == 5, "Expected: 5 requests were created, one for each user in the group. Actual: " + numberOfRequests);
    test(userToTest.getFirstName().equals("Pending"), "Expected: Tested user's first name is 'Pending' at the start of the test. Actual: " + userToTest.getFirstName());
DAO unapprovedRequestDAO = ApprovalRequestUtil.getAllRequests(x, ((Long)userToTest.getId()).toString(), initialRequest.getClassification()).where(NEQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED));
    unapprovedRequestDAO.limit(2).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        ApprovalRequest req = (ApprovalRequest)((ApprovalRequest) obj).fclone();
        req.setStatus(ApprovalStatus.APPROVED);
        requestDAO.put_(x, req);
      }
    });

    userToTest = (User) userDAO.find(userToTest);

    test(userToTest.getFirstName().equals("Pending"), "Expected: Tested user's first name is still 'Pending' after 2 requests were approved. Actual: " + userToTest.getFirstName());

    unapprovedRequestDAO.limit(1).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        ApprovalRequest req = (ApprovalRequest)((ApprovalRequest) obj).fclone();
        req.setStatus(ApprovalStatus.APPROVED);
        requestDAO.put_(x, req);
      }
    });

    userToTest = (User) userDAO.find(userToTest);
    numberOfRequests = ((Count)requestDAO.select(new Count())).getValue();

    test(userToTest.getFirstName().equals("Approved"), "Expected: Tested user's first name is 'Approved' since required number of requests were approved. Actual: " + userToTest.getFirstName());
    test(numberOfRequests == 3, "Expected: only 3 requests left in approvalDAO since unused requests were removed after object is approved. Actual: " + numberOfRequests);
  }
  private void createGroup() {
    group = new Group();
    group.setId("testApprovalRequest");
    groupDAO.put(group);
  }

  private void createUsers() {
    User user;
    for ( int i = 5000; i < 5005; i++ ) {
      user = new User();
      user.setId(i);
      user.setFirstName("approver ");
      user.setGroup(group.getId());
      userDAO.put(user);
    }
  }

  private void createGroupRequest() {
    initialRequest = new ApprovalRequest();
    initialRequest.setGroup(group.getId());
    initialRequest.setRequiredPoints(3);
    initialRequest.setClassification("testing approval system");
    initialRequest.setDaoKey("localUserDAO");
  }

  private void createUserRule(X ctx) {
    Rule rule = new Rule();
    rule.setId(1);
    rule.setName("testing approval");
    rule.setRuleGroup("test approval_CREATE");
    rule.setDaoKey("testUserDAO");
    rule.setOperation(Operations.CREATE);
    rule.setAfter(true);
    Predicate predicate = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule.setPredicate(predicate);
    RuleAction action = (x, obj, oldObj, ruler, agency) -> {
      initialRequest.setObjId(((Long)((User)obj).getId()).toString());
      initialRequest = (ApprovalRequest) requestDAO.inX(ctx).put(initialRequest);
    };
    rule.setAction(action);
    ruleDAO.put(rule);

    Rule rule2 = new Rule();
    rule2.setId(2);
    rule2.setName("testing approval");
    rule2.setRuleGroup("test approval_UPDATE");
    rule2.setDaoKey("testUserDAO");
    rule2.setOperation(Operations.UPDATE);
    rule2.setAfter(false);
    Predicate predicate2 = EQ(DOT(NEW_OBJ, INSTANCE_OF(foam.nanos.auth.User.class)), true);
    rule.setPredicate(predicate2);
    RuleAction action2 = (RuleAction) (x, obj, oldObj, ruler, agency) -> {
      User user = (User) obj;
      long points = ApprovalRequestUtil.getApprovedPoints(ctx, ((Long)userToTest.getId()).toString(), initialRequest.getClassification());

      if ( points >= initialRequest.getRequiredPoints() ) {
        user.setFirstName("Approved");
      }
    };
    rule2.setAction(action2);
    ruleDAO.put(rule2);
  }
}
